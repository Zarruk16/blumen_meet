"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useMeetingChat } from "../../hooks/useMeetingChat";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const { messages, sendMessage } = useMeetingChat();
  const [text, setText] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center text-zinc-500 px-4">
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to everyone in the meeting</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "rounded-lg px-3 py-2 text-sm max-w-[90%]",
                m.isLocal
                  ? "ml-auto bg-sky-600/30 text-white border border-sky-500/20"
                  : "bg-white/5 text-zinc-200 border border-white/5"
              )}
            >
              <p className="text-[10px] font-medium text-zinc-400 mb-0.5">{m.sender}</p>
              <p>{m.text}</p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={onSubmit} className="border-t border-white/10 p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-3 py-2 text-white hover:bg-sky-500"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
