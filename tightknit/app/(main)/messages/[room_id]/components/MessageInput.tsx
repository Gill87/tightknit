"use client";

import { useState } from "react";
import { tkRoom } from "../../formStyles";

export function MessageInput({ placeholder }: { placeholder: string }) {
  const [value, setValue] = useState("");

  return (
    <div className={tkRoom.inputBar}>
      <input
        className={tkRoom.inputField}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="Message input"
      />
      <button
        className={tkRoom.sendBtn}
        aria-label="Send message"
        disabled={!value.trim()}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white translate-x-px"
          aria-hidden
        >
          <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      </button>
    </div>
  );
}
