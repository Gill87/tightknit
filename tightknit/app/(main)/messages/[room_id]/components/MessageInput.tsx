"use client";

import { useEffect, useState } from "react";
import { useFooter } from "@/app/(main)/FooterProvider";
import { tkRoom } from "../../formStyles";

export function MessageInput({
  placeholder,
  onSend,
}: {
  placeholder: string;
  onSend: (text: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const { setHidden } = useFooter();
  useEffect(() => () => setHidden(false), [setHidden]);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setValue("");
    await onSend(trimmed);
    setSending(false);
  };

  return (
    <div className={tkRoom.inputBar}>
      <input
        className={tkRoom.inputField}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setHidden(true)}
        onBlur={() => setHidden(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        aria-label="Message input"
      />
      <button
        className={tkRoom.sendBtn}
        onClick={handleSend}
        disabled={!value.trim() || sending}
        aria-label="Send message"
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
