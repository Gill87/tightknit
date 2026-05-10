"use client";

import { useRouter } from "next/navigation";
import { tkRoom } from "../../formStyles";

export function ChatHeader({
  participantName,
  subtitle,
}: {
  participantName: string;
  subtitle: string;
}) {
  const router = useRouter();
  const initial = participantName.charAt(0).toUpperCase();

  return (
    <header className={tkRoom.headerBar}>
      <button
        className={tkRoom.backBtn}
        onClick={() => router.push("/messages")}
        aria-label="Back"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-tk-forest"
          aria-hidden
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <div className={tkRoom.headerAvatar}>{initial}</div>

      <div className={tkRoom.headerInfo}>
        <p className={tkRoom.headerName}>{participantName}</p>
        <p className={tkRoom.headerSub}>{subtitle}</p>
      </div>

      <button className={tkRoom.markCompleteBtn}>Mark complete</button>
    </header>
  );
}
