import { ChatHeader } from "./components/ChatHeader";
import { MessageBubble, type Message } from "./components/MessageBubble";
import { MessageInput } from "./components/MessageInput";
import { tkRoom } from "../formStyles";

// TODO: replace with Supabase query by room_id param
const MOCK: { participantName: string; subtitle: string; messages: Message[] } =
  {
    participantName: "Sarah K.",
    subtitle: "re: Groceries up the stairs",
    messages: [
      {
        id: "1",
        text: "Hi! I saw your request — I can help carry those groceries up.",
        time: "4:12 PM",
        isSent: true,
        showCheck: true,
      },
      {
        id: "2",
        text: "Oh amazing!! Thank you so much. I'm in Apt 4B 🙏",
        time: "4:13 PM",
        isSent: false,
      },
      {
        id: "3",
        text: "On my way now, be there in 5 mins!",
        time: "4:15 PM",
        isSent: true,
        showCheck: true,
      },
      {
        id: "4",
        text: "Thank you so much!! That was such a help 🙏",
        time: "4:22 PM",
        isSent: false,
      },
    ],
  };

export default function RoomPage() {
  const firstName = MOCK.participantName.split(" ")[0];

  return (
    <div className={tkRoom.shell}>
      <ChatHeader
        participantName={MOCK.participantName}
        subtitle={MOCK.subtitle}
      />
      <div className={tkRoom.thread}>
        {MOCK.messages.map((m) => (
          <MessageBubble key={m.id} {...m} />
        ))}
      </div>
      <MessageInput placeholder={`Message ${firstName}…`} />
    </div>
  );
}
