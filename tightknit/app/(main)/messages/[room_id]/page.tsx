"use client";

import { use, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useChat } from "../hooks/useChat";
import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble } from "./components/MessageBubble";
import { MessageInput } from "./components/MessageInput";
import { tkRoom } from "../formStyles";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [participantName, setParticipantName] = useState("...");
  const [subtitle, setSubtitle] = useState("");

  useEffect(() => {
    async function init() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      // room_id format: listing_{listingId}_{userId1}_{userId2}
      // UUIDs use hyphens internally so underscore-split is safe
      const [, listingId, ...userIds] = room_id.split("_");
      const otherUserId = userIds.find((uid) => uid !== user.id) ?? userIds[0];

      const [{ data: listing }, { data: profile }] = await Promise.all([
        supabase
          .from("listings")
          .select("description")
          .eq("id", listingId)
          .single(),
        supabase
          .from("profiles")
          .select("name")
          .eq("id", otherUserId)
          .single(),
      ]);

      if (profile?.name) setParticipantName(profile.name);
      if (listing?.description) {
        const desc = listing.description as string;
        setSubtitle(`re: ${desc.length > 35 ? desc.slice(0, 35) + "…" : desc}`);
      }
    }
    init();
  }, [room_id]);

  const { messages, sendMessage } = useChat(room_id, currentUserId ?? "");
  const firstName =
    participantName.split(" ")[0]?.replace(/\.$/, "") ?? participantName;

  return (
    <div className={tkRoom.shell}>
      <ChatHeader participantName={participantName} subtitle={subtitle} />
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
      </div>
      <MessageInput placeholder={`Message ${firstName}…`} onSend={sendMessage} />
    </div>
  );
}
