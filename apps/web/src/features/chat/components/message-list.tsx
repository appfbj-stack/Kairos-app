"use client";

import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@kairos/chat/types";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isLoading: boolean;
}

export function MessageList({ messages, currentUserId, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <div className="w-6 h-6 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span className="text-sm">Carregando mensagens...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="mb-3 rounded-full bg-muted p-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold">Início da conversa</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seja o primeiro a enviar uma mensagem!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 flex flex-col">
      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const showSender =
          !prev || prev.senderId !== message.senderId;

        return (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.senderId === currentUserId}
            showSender={showSender}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
