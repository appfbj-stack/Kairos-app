"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";
import type { ChatRoom } from "@kairos/chat/types";
import type { CreateRoomSchema } from "@kairos/chat/schemas";

export function useRooms() {
  const supabase = createBrowserClient();

  return useQuery({
    queryKey: ["chat-rooms"],
    queryFn: async (): Promise<ChatRoom[]> => {
      const { data, error } = await supabase
        .from("chat_rooms")
        .select("*")
        .order("name");

      if (error) throw error;

      return (data ?? []).map((r) => ({
        id: r.id,
        churchId: r.church_id,
        name: r.name,
        type: r.type as ChatRoom["type"],
        createdAt: r.created_at,
        createdBy: r.created_by,
      }));
    },
  });
}

export function useCreateRoom() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateRoomSchema) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();

      if (!profile) throw new Error("Perfil não encontrado");

      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          name: input.name,
          type: input.type,
          church_id: profile.church_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
}
