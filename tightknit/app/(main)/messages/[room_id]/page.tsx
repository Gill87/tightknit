"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase/client";
import {
  parseListingRoom,
  resolveParticipantDisplayName,
} from "@/lib/messaging/participantDisplayName";
import { useChat } from "../hooks/useChat";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble } from "./components/MessageBubble";
import { MessageInput } from "./components/MessageInput";
import { tkRoom } from "../formStyles";

type ListingCompletionRow = {
  completed_at: string | null;
  completion_ack_user_ids: string[] | null;
  status: string | null;
};

function completionButtonMeta(
  listing: ListingCompletionRow | null,
  currentUserId: string | null,
  peerIds: [string, string] | null,
): { label: string; disabled: boolean } {
  if (!listing || !currentUserId || !peerIds) {
    return { label: "Mark complete", disabled: true };
  }
  const acks = listing.completion_ack_user_ids ?? [];
  if (listing.completed_at != null) {
    return { label: "Completed", disabled: true };
  }
  const bothAcked =
    peerIds.every((id) => acks.includes(id));
  if (bothAcked) {
    return { label: "Completed", disabled: true };
  }
  const iAcked = acks.includes(currentUserId);
  if (acks.length >= 1 && iAcked) {
    return { label: "Pending complete", disabled: true };
  }
  return { label: "Mark complete", disabled: false };
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ room_id: string }>;
}) {
  const { room_id } = use(params);
  const parsedRoom = useMemo(() => parseListingRoom(room_id), [room_id]);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [listingCompletion, setListingCompletion] =
    useState<ListingCompletionRow | null>(null);
  const [completeBusy, setCompleteBusy] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const parsed = parseListingRoom(room_id);
      if (!parsed) return;

      const otherUserId =
        parsed.peerIds.find((uid) => uid !== user.id) ?? parsed.peerIds[0];

      const [
        { data: listing, error: listingErr },
        { data: profile, error: profileErr },
      ] = await Promise.all([
        supabase
          .from("listings")
          .select(
            "posted_by, posted_by_name, description, completed_at, completion_ack_user_ids, status",
          )
          .eq("id", parsed.listingId)
          .single(),
        supabase
          .from("profiles")
          .select("full_name, username")
          .eq("id", otherUserId)
          .single(),
      ]);
      if (listingErr) console.warn("[chat] listing fetch error", listingErr);
      if (profileErr) console.warn("[chat] profile fetch error", profileErr);

      if (listing) {
        setListingCompletion({
          completed_at: (listing.completed_at as string | null) ?? null,
          completion_ack_user_ids:
            (listing.completion_ack_user_ids as string[] | null) ?? [],
          status: (listing.status as string | null) ?? null,
        });
      }

      if (listing?.description) {
        const desc = listing.description as string;
        setSubtitle(`re: ${desc.length > 35 ? desc.slice(0, 35) + "…" : desc}`);
      }

      const name = resolveParticipantDisplayName({
        listingPostedBy: listing?.posted_by,
        listingPostedByName: listing?.posted_by_name,
        otherUserId,
        profile: profile ?? null,
      });
      if (name === "Neighbor") {
        console.warn("[chat] no name resolved", {
          listingId: parsed.listingId,
          otherUserId,
          listingFound: !!listing,
        });
      }
      setParticipantName(name);
    }
    init();
  }, [room_id]);

  useEffect(() => {
    const listingId = parsedRoom?.listingId;
    if (!listingId) return;

    const supabase = getSupabase();
    const channel = supabase
      .channel(`listing-completion:${listingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "listings",
          filter: `id=eq.${listingId}`,
        },
        (payload: {
          new: Record<string, unknown>;
        }) => {
          const row = payload.new;
          setListingCompletion({
            completed_at: (row.completed_at as string | null) ?? null,
            completion_ack_user_ids:
              (row.completion_ack_user_ids as string[] | null) ?? [],
            status: (row.status as string | null) ?? null,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [parsedRoom?.listingId]);

  const handleMarkComplete = async () => {
    if (!parsedRoom || completeBusy || !currentUserId) return;
    const meta = completionButtonMeta(
      listingCompletion,
      currentUserId,
      parsedRoom.peerIds,
    );
    if (meta.disabled) return;

    setCompleteBusy(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.rpc(
        "acknowledge_listing_completion",
        { p_room_id: room_id },
      );
      if (error) {
        console.warn("[chat] acknowledge_listing_completion error", error);
        return;
      }
      const payload = data as {
        finalized?: boolean;
        completed_at?: string | null;
        completion_ack_user_ids?: string[];
        status?: string;
      };
      setListingCompletion((prev) => ({
        completed_at:
          payload.completed_at != null
            ? payload.completed_at
            : (prev?.completed_at ?? null),
        completion_ack_user_ids:
          payload.completion_ack_user_ids ??
          prev?.completion_ack_user_ids ??
          [],
        status: payload.status ?? prev?.status ?? null,
      }));
    } finally {
      setCompleteBusy(false);
    }
  };

  const completeBtn = completionButtonMeta(
    listingCompletion,
    currentUserId,
    parsedRoom?.peerIds ?? null,
  );

  const { messages, sendMessage } = useChat(room_id, currentUserId ?? "");
  const headerTitle =
    participantName ||
    (parsedRoom ? "Loading…" : "");
  const firstName = participantName.trim()
    ? participantName.split(" ")[0]?.replace(/\.$/, "") ?? participantName
    : "them";

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!parsedRoom) {
    return (
      <div className={tkRoom.shell}>
        <div className={`${tkRoom.thread} px-4 py-8`}>
          <p className="text-sm font-medium text-tk-forest" role="alert">
            This conversation link is invalid or outdated.
          </p>
          <p className="mt-2 text-sm text-tk-muted">
            Check the URL or open Messages from your home screen.
          </p>
          <Link
            href="/messages"
            className="mt-4 inline-block text-sm font-medium text-tk-forest underline"
          >
            Back to Messages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={tkRoom.shell}>
      <ChatHeader
        participantName={headerTitle}
        subtitle={subtitle}
        completeLabel={completeBtn.label}
        completeDisabled={completeBtn.disabled}
        completeBusy={completeBusy}
        onMarkComplete={handleMarkComplete}
      />
      <div className={tkRoom.thread}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            id={m.id}
            text={m.content}
            time={formatTime(m.created_at)}
            isSent={m.sender_id === currentUserId}
            showCheck={m.sender_id === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput placeholder={`Message ${firstName}…`} onSend={sendMessage} />
    </div>
  );
}
