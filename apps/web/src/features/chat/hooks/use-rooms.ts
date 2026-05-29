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

      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("church_id, role")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) throw new Error("Perfil não encontrado. Recarregue a página.");
      if (!profile.church_id) throw new Error("Igreja não configurada. Recarregue a página.");

      const allowedRoles = ["church_admin", "pastor", "leader", "super_admin"];
      if (!allowedRoles.includes(profile.role)) {
        throw new Error("Sem permissão para criar salas. Apenas líderes podem criar.");
      }

      // Tenta inserir com created_by; se a coluna não existir, insere sem ela
      let insertResult = await supabase
        .from("chat_rooms")
        .insert({ name: input.name, type: input.type, church_id: profile.church_id, created_by: user.id })
        .select().single();

      // Fallback: tenta sem created_by se a coluna não existir
      if (insertResult.error?.message?.includes("created_by")) {
        insertResult = await supabase
          .from("chat_rooms")
          .insert({ name: input.name, type: input.type, church_id: profile.church_id })
          .select().single();
      }

      if (insertResult.error) {
        const err = insertResult.error;
        if (err.code === "42501") throw new Error("Sem permissão para criar salas. Verifique se você é líder ou admin.");
        throw new Error(err.message);
      }
      return insertResult.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });
}
