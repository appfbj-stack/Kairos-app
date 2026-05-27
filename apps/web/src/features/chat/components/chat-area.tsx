"use client";

import { Hash, Users, Settings } from "lucide-react";
import { toast } from "sonner";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useMessages, useSendMessage } from "../hooks/use-messages";
import type { ChatRoom } from "@kairos/chat/types";

interface ChatAreaProps {
  room: ChatRoom;
  currentUserId: string;
}

export function ChatArea({ room, currentUserId }: ChatAreaProps) {
  const { data: messages = [], isLoading } = useMessages(room.id);
  const sendMessage = useSendMessage(room.id);

  const handleSend = (content: string) => {
    sendMessage.mutate(content, {
      onError: () => toast.error("Erro ao enviar mensagem"),
    });
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">{room.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Users className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput
        roomName={room.name}
        onSend={handleSend}
        disabled={sendMessage.isPending}
      />
    </div>
  );
}
