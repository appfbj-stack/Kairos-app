"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateMember, useUpdateMember } from "../hooks/use-members";
import type { Database } from "@kairos/types";

type Member = Database["public"]["Tables"]["members"]["Row"];

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  birthdate: z.string().optional(),
  baptism_date: z.string().optional(),
  status: z.enum(["active", "inactive", "visitor"]).default("active"),
});
type FormData = z.infer<typeof schema>;

interface MemberFormProps {
  member?: Member;
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "visitor", label: "Visitante" },
];

export function MemberForm({ member }: MemberFormProps) {
  const router = useRouter();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const isEditing = !!member;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: member
      ? {
          name: member.name,
          email: member.email ?? "",
          phone: member.phone ?? "",
          birthdate: member.birthdate ?? "",
          baptism_date: member.baptism_date ?? "",
          status: member.status as FormData["status"],
        }
      : { status: "active" },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        birthdate: data.birthdate || null,
        baptism_date: data.baptism_date || null,
        status: data.status,
      };

      if (isEditing) {
        await updateMember.mutateAsync({ id: member.id, ...payload });
        toast.success("Membro atualizado!");
      } else {
        await createMember.mutateAsync(payload);
        toast.success("Membro cadastrado!");
      }
      router.push("/members");
    } catch {
      toast.error("Erro ao salvar membro");
    }
  };

  const fields = [
    { name: "name", label: "Nome completo *", placeholder: "João da Silva", type: "text" },
    { name: "email", label: "Email", placeholder: "joao@email.com", type: "email" },
    { name: "phone", label: "Telefone", placeholder: "(11) 99999-9999", type: "tel" },
    { name: "birthdate", label: "Data de nascimento", placeholder: "", type: "date" },
    { name: "baptism_date", label: "Data de batismo", placeholder: "", type: "date" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium mb-1">{field.label}</label>
          <input
            {...register(field.name)}
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          {errors[field.name] && (
            <p className="text-destructive text-xs mt-1">{errors[field.name]?.message}</p>
          )}
        </div>
      ))}

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          {...register("status")}
          className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/members")}
          className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
