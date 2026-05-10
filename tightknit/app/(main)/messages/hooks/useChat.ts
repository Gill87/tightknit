import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export function useChat(roomId: string, userId: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    getSupabase()
      .from("messages")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })
      .then(({ data }: { data: Message[] | null }) => setMessages(data ?? []));
  }, [roomId]);

  useEffect(() => {
    const channel = getSupabase()
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: { new: Message }) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { getSupabase().removeChannel(channel); };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    await getSupabase().from("messages").insert({
      room_id: roomId,
      sender_id: userId,
      content,
    });
  };

  return { messages, sendMessage };
}