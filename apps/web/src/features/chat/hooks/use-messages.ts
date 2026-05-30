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
      if (!roomId) return [];

      const { data, error } = await supabase
        .from("messages")
        .select("id, church_id, room_id, sender_id, content, type, media_url, created_at, users!sender_id(id, name, avatar_url, role)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(PAGE_SIZE);

      if (error) {
        console.error("useMessages error:", error);
        return [];
      }

      return (data ?? []).map((m) => {
        const sender = Array.isArray(m.users) ? m.users[0] : m.users;
        return {
          id: m.id,
          churchId: m.church_id ?? "",
          roomId: m.room_id ?? "",
          senderId: m.sender_id ?? "",
          content: m.content ?? "",
          type: (m.type ?? "text") as ChatMessage["type"],
          mediaUrl: m.media_url ?? null,
          createdAt: m.created_at ?? new Date().toISOString(),
          sender: sender ? {
            id: sender.id,
            name: sender.name,
            avatarUrl: sender.avatar_url,
            role: sender.role,
          } : undefined,
        };
      });
    },
    enabled: !!roomId,
    refetchInterval: false,
  });

  // Realtime subscription
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, async (payload) => {
        const msg = payload.new as Record<string, unknown>;
        const { data: senderData } = await supabase
          .from("users")
          .select("id, name, avatar_url, role")
          .eq("id", msg.sender_id as string)
          .single();

        const newMessage: ChatMessage = {
          id: msg.id as string,
          churchId: msg.church_id as string ?? "",
          roomId: msg.room_id as string ?? "",
          senderId: msg.sender_id as string ?? "",
          content: msg.content as string ?? "",
          type: (msg.type as ChatMessage["type"]) ?? "text",
          mediaUrl: msg.media_url as string | null ?? null,
          createdAt: msg.created_at as string ?? new Date().toISOString(),
          sender: senderData ? {
            id: senderData.id,
            name: senderData.name,
            avatarUrl: senderData.avatar_url,
            role: senderData.role,
          } : undefined,
        };

        queryClient.setQueryData<ChatMessage[]>(["messages", roomId], (prev) =>
          prev ? [...prev, newMessage] : [newMessage]
        );
      })
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
      if (!user) throw new Error("Você precisa estar logado.");

      const { data: profile } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();

      const church_id = profile?.church_id;
      if (!church_id) throw new Error("Perfil não configurado.");

      // Tenta inserir com todos os campos
      const { error } = await supabase.from("messages").insert({
        room_id: roomId,
        sender_id: user.id,
        church_id,
        content: content.trim(),
        type: "text",
        created_by: user.id,
      });

      if (error) {
        console.error("sendMessage error:", error);
        // Fallback sem created_by
        const { error: error2 } = await supabase.from("messages").insert({
          room_id: roomId,
          sender_id: user.id,
          church_id,
          content: content.trim(),
          type: "text",
        });
        if (error2) throw new Error(`Erro ao enviar: ${error2.message}`);
      }
    },
  });
}
