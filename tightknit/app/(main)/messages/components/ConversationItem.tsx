import Link from "next/link";
import { tkMessages } from "../formStyles";
import type { Conversation } from "@/lib/queries/messages";

export type { Conversation };

export function ConversationItem({
  conversation,
  index,
}: {
  conversation: Conversation;
  index: number;
}) {
  const initial = conversation.participantName.charAt(0).toUpperCase();

  return (
    <Link href={`/messages/${conversation.roomId}`} className={tkMessages.row}>
      <div className={tkMessages.avatarWrap}>
        <div className={tkMessages.avatar(index)}>{initial}</div>
      </div>
      <div className={tkMessages.body}>
        <div className={tkMessages.nameRow}>
          <span className={tkMessages.name}>{conversation.participantName}</span>
          <span className={tkMessages.time}>{conversation.timestamp}</span>
        </div>
        <div className={tkMessages.previewRow}>
          <p className={tkMessages.preview}>{conversation.lastMessage}</p>
          {conversation.unreadCount > 0 && (
            <span className={tkMessages.unreadBadge}>
              {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
