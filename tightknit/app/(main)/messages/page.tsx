"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { tkMessages } from "./formStyles";
import { ConversationItem, type Conversation } from "./components/ConversationItem";

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: msgs } = await supabase
        .from("messages")
        .select("room_id, content, created_at, sender_id")
        .like("room_id", `%${user.id}%`)
        .order("created_at", { ascending: false });

      if (!msgs?.length) return;

      // Keep only the latest message per room (msgs already sorted DESC)
      const roomMap = new Map<string, (typeof msgs)[0]>();
      for (const msg of msgs) {
        if (!roomMap.has(msg.room_id)) roomMap.set(msg.room_id, msg);
      }

      // Parse the other participant's userId from each room_id
      // Format: listing_{listingId}_{userId1}_{userId2}
      const rooms = [...roomMap.entries()].map(([roomId, msg]) => {
        const [, , ...userIds] = roomId.split("_");
        const otherUserId =
          userIds.find((uid) => uid !== user.id) ?? userIds[0];
        return { roomId, otherUserId, msg };
      });

      // Batch-fetch all participant names in one query
      const otherIds = [...new Set(rooms.map((r) => r.otherUserId))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", otherIds);

      const nameById = Object.fromEntries(
        (profiles ?? []).map((p: { id: string; name: string }) => [p.id, p.name])
      );

      setConversations(
        rooms.map(({ roomId, otherUserId, msg }, i) => ({
          id: String(i),
          roomId,
          participantName: nameById[otherUserId] ?? "Neighbor",
          lastMessage: msg.content,
          timestamp: timeAgo(msg.created_at),
          unreadCount: 0,
        }))
      );
    }
    load();
  }, []);

  return (
    <div className={tkMessages.shell}>
      <div className={tkMessages.inner}>
        <h1 className={tkMessages.header}>Messages</h1>
        <div className={tkMessages.list}>
          {conversations.map((conv, i) => (
            <ConversationItem key={conv.roomId} conversation={conv} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
