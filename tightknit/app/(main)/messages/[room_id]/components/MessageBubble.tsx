import { tkRoom } from "../../formStyles";

export type Message = {
  id: string;
  text: string;
  time: string;
  isSent: boolean;
  showCheck?: boolean;
};

export function MessageBubble({ text, time, isSent, showCheck }: Message) {
  return (
    <div className={tkRoom.bubbleWrap(isSent)}>
      <div className={tkRoom.bubble(isSent)}>
        <p className={tkRoom.bubbleText}>{text}</p>
        <div className={tkRoom.bubbleMeta}>
          <span className={tkRoom.bubbleTime(isSent)}>{time}</span>
          {isSent && showCheck && (
            <svg
              width="14"
              height="10"
              viewBox="0 0 14 10"
              fill="none"
              aria-hidden
              className="opacity-70"
            >
              <path
                d="M1 5l3 3 5-7M5 5l3 3 5-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
