import Link from "next/link";
import { tkMessages } from "../formStyles";

export type Conversation = {
  id: string;
  roomId: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
};

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
        {conversation.unreadCount > 0 && (
          <span className={tkMessages.badge}>{conversation.unreadCount}</span>
        )}
      </div>
      <div className={tkMessages.body}>
        <div className={tkMessages.nameRow}>
          <span className={tkMessages.name}>{conversation.participantName}</span>
          <span className={tkMessages.time}>{conversation.timestamp}</span>
        </div>
        <p className={tkMessages.preview}>{conversation.lastMessage}</p>
      </div>
    </Link>
  );
}
