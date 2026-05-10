"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { tkMessages } from "./formStyles";
import { ConversationItem, type Conversation } from "./components/ConversationItem";
import {
  parseListingRoom,
  resolveParticipantDisplayName,
} from "@/lib/messaging/participantDisplayName";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: msgs } = await supabase
        .from("messages")
        .select("room_id, content, created_at, sender_id")
        .like("room_id", `%${user.id}%`)
        .order("created_at", { ascending: false });

      if (!msgs?.length) {
        setIsLoading(false);
        return;
      }

      // Keep only the latest message per room (msgs already sorted DESC)
      const roomMap = new Map<string, (typeof msgs)[0]>();
      for (const msg of msgs) {
        if (!roomMap.has(msg.room_id)) roomMap.set(msg.room_id, msg);
      }

      // Parse listingId and the other participant's userId from each room_id
      const rooms = [...roomMap.entries()].map(([roomId, msg]) => {
        const parsed = parseListingRoom(roomId);
        if (!parsed) {
          return { roomId, msg, invalidRoom: true as const };
        }
        const otherUserId =
          parsed.peerIds.find((uid) => uid !== user.id) ?? parsed.peerIds[0];
        return {
          roomId,
          listingId: parsed.listingId,
          otherUserId,
          msg,
          invalidRoom: false as const,
        };
      });

      // Batch-fetch listings so we know who the poster is per room
      const listingIds = [
        ...new Set(
          rooms
            .filter((r) => !r.invalidRoom)
            .map((r) => r.listingId),
        ),
      ];
      const { data: listings, error: listingsError } = await supabase
        .from("listings")
        .select("id, posted_by, posted_by_name")
        .in("id", listingIds);
      if (listingsError)
        console.warn("[messages] listings fetch error", listingsError);
      const listingById = new Map<
        string,
        { posted_by: string; posted_by_name: string | null }
      >(
        (listings ?? []).map(
          (l: { id: string; posted_by: string; posted_by_name: string | null }) => [
            l.id,
            { posted_by: l.posted_by, posted_by_name: l.posted_by_name },
          ]
        )
      );

      // Unconditionally fetch profile full_names for every other party,
      // so we have a fallback even when posted_by_name is null
      const otherIds = [
        ...new Set(
          rooms
            .filter((r) => !r.invalidRoom)
            .map((r) => r.otherUserId),
        ),
      ];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, username")
        .in("id", otherIds);
      if (profilesError)
        console.warn("[messages] profiles fetch error", profilesError);
      const profileById = new Map<
        string,
        { full_name: string | null; username: string | null }
      >(
        (profiles ?? []).map(
          (p: {
            id: string;
            full_name: string | null;
            username: string | null;
          }) => [p.id, { full_name: p.full_name, username: p.username }],
        ),
      );

      const resolveName = (
        listingId: string,
        otherUserId: string,
      ): string => {
        const listing = listingById.get(listingId);
        const name = resolveParticipantDisplayName({
          listingPostedBy: listing?.posted_by,
          listingPostedByName: listing?.posted_by_name,
          otherUserId,
          profile: profileById.get(otherUserId) ?? null,
        });
        if (name === "Neighbor") {
          console.warn("[messages] no name resolved", {
            listingId,
            otherUserId,
            listingFound: !!listing,
          });
        }
        return name;
      };

      setConversations(
        rooms.map((row, i) => {
          if (row.invalidRoom) {
            return {
              id: String(i),
              roomId: row.roomId,
              participantName: "Invalid conversation",
              lastMessage: row.msg.content,
              timestamp: timeAgo(row.msg.created_at),
              unreadCount: 0,
            };
          }
          const { roomId, listingId, otherUserId, msg } = row;
          return {
            id: String(i),
            roomId,
            participantName: resolveName(listingId, otherUserId),
            lastMessage: msg.content,
            timestamp: timeAgo(msg.created_at),
            unreadCount: 0,
          };
        }),
      );
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className={tkMessages.shell}>
      <div className={tkMessages.inner}>
        <h1 className={tkMessages.header}>Messages</h1>
        <div className={tkMessages.list}>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-tk-muted">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="py-8 text-center text-sm text-tk-muted">
              You have 0 message conversations
            </p>
          ) : (
            conversations.map((conv, i) => (
              <ConversationItem key={conv.roomId} conversation={conv} index={i} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
