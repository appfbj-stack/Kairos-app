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
        .select("id, name, type, church_id, created_at, created_by")
        .order("name");

      if (error) {
        console.error("useRooms error:", error);
        return [];
      }

      return (data ?? []).map((r) => ({
        id: r.id,
        churchId: r.church_id ?? "",
        name: r.name ?? "",
        type: (r.type ?? "general") as ChatRoom["type"],
        createdAt: r.created_at ?? new Date().toISOString(),
        createdBy: r.created_by ?? "",
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
      if (!user) throw new Error("Você precisa estar logado para criar uma sala.");

      // Busca church_id do perfil
      const { data: profile } = await supabase
        .from("users")
        .select("church_id")
        .eq("id", user.id)
        .single();

      const church_id = profile?.church_id;
      if (!church_id) throw new Error("Perfil não configurado. Recarregue a página.");

      // Insere a sala — sem verificação de role no cliente (RLS cuida disso)
      const { data, error } = await supabase
        .from("chat_rooms")
        .insert({
          name: input.name,
          type: input.type ?? "general",
          church_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("createRoom error:", error);
        // Se falhar com created_by, tenta sem
        if (error.message?.includes("created_by")) {
          const { data: data2, error: error2 } = await supabase
            .from("chat_rooms")
            .insert({ name: input.name, type: input.type ?? "general", church_id })
            .select()
            .single();
          if (error2) throw new Error(`Erro ao criar sala: ${error2.message}`);
          return data2;
        }
        throw new Error(`Erro ao criar sala: ${error.message}`);
      }
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
}
