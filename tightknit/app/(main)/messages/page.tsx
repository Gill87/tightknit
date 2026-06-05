"use client";

import { tkMessages } from "./formStyles";
import { ConversationItem } from "./components/ConversationItem";
import { useCurrentUser } from "@/lib/queries/profile";
import { useConversations } from "@/lib/queries/messages";

export default function MessagesPage() {
  const { data: user } = useCurrentUser();
  const { data: conversations = [], isPending } = useConversations(user?.id);

  return (
    <div className={tkMessages.shell}>
      <div className={tkMessages.inner}>
        <h1 className={tkMessages.header}>Messages</h1>
        <div className={tkMessages.list}>
          {isPending ? (
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
