import { tkMessages } from "./formStyles";
import { ConversationItem, type Conversation } from "./components/ConversationItem";

// TODO: replace with Supabase query (conversations joined with profiles)
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participantName: "Sarah K.",
    lastMessage: "Thank you so much!! That was such a help 🙏",
    timestamp: "4m",
    unreadCount: 1,
  },
  {
    id: "2",
    participantName: "Marcus T.",
    lastMessage: "Hey! Can you do 3pm?",
    timestamp: "22m",
    unreadCount: 0,
  },
  {
    id: "3",
    participantName: "Priya D.",
    lastMessage: "Perfect, see you then!",
    timestamp: "2h",
    unreadCount: 0,
  },
];

export default function MessagesPage() {
  return (
    <div className={tkMessages.shell}>
      <div className={tkMessages.inner}>
        <h1 className={tkMessages.header}>Messages</h1>
        <div className={tkMessages.list}>
          {MOCK_CONVERSATIONS.map((conv, i) => (
            <ConversationItem key={conv.id} conversation={conv} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
