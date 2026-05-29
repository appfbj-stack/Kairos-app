"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@kairos/chat/types";

const PAGE_SIZE = 50;

export function useMessages(roomId: string) {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["messages", roomId],
    queryFn: async (): Promise<ChatMessage[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id, church_id, room_id, sender_id, content, type, media_url, created_at,
          users!sender_id(id, name, avatar_url, role)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(PAGE_SIZE);

      if (error) throw error;

      return (data ?? []).map((m) => {
        const sender = Array.isArray(m.users) ? m.users[0] : m.users;
        return {
          id: m.id,
          churchId: m.church_id,
          roomId: m.room_id,
          senderId: m.sender_id,
          content: m.content,
          type: m.type as ChatMessage["type"],
          mediaUrl: m.media_url,
          createdAt: m.created_at,
          sender: sender
            ? { id: sender.id, name: sender.name, avatarUrl: sender.avatar_url, role: sender.role }
            : undefined,
        };
      });
    },
    enabled: !!roomId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const msg = payload.new as {
            id: string; church_id: string; room_id: string; sender_id: string;
            content: string; type: string; media_url: string | null; created_at: string;
          };

          const { data: senderData } = await supabase
            .from("users").select("id, name, avatar_url, role").eq("id", msg.sender_id).single();

          const newMessage: ChatMessage = {
            id: msg.id, churchId: msg.church_id, roomId: msg.room_id, senderId: msg.sender_id,
            content: msg.content, type: msg.type as ChatMessage["type"], mediaUrl: msg.media_url,
            createdAt: msg.created_at,
            sender: senderData
              ? { id: senderData.id, name: senderData.name, avatarUrl: senderData.avatar_url, role: senderData.role }
              : undefined,
          };

          queryClient.setQueryData<ChatMessage[]>(["messages", roomId], (prev) =>
            prev ? [...prev, newMessage] : [newMessage]
          );
        }
      )
      .subscribe();

    return () => { void supabase.removeChannel(channel); };
  }, [roomId, supabase, queryClient]);

  return query;
}

export function useSendMessage(roomId: string) {
  const supabase = createBrowserClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile, error: profileError } = await supabase
        .from("users").select("church_id").eq("id", user.id).single();

      if (profileError || !profile) throw new Error("Perfil não encontrado. Recarregue a página.");
      if (!profile.church_id) throw new Error("Igreja não configurada. Recarregue a página.");

      let result = await supabase.from("messages").insert({
        room_id: roomId, sender_id: user.id, church_id: profile.church_id,
        content: content.trim(), type: "text", created_by: user.id,
      });

      // Fallback sem created_by se a coluna não existir
      if (result.error?.message?.includes("created_by")) {
        result = await supabase.from("messages").insert({
          room_id: roomId, sender_id: user.id, church_id: profile.church_id,
          content: content.trim(), type: "text",
        });
      }

      if (result.error) throw new Error(result.error.message);
    },
  });
}
