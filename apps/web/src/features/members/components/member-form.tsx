"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateMember, useUpdateMember } from "../hooks/use-members";
import { useAvatarUpload } from "../hooks/use-avatar-upload";
import { AvatarUpload } from "./avatar-upload";
import type { Database } from "@kairos/types";

type Member = Database["public"]["Tables"]["members"]["Row"];

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  birthdate: z.string().optional(),
  baptism_date: z.string().optional(),
  affiliation_date: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  parents_name: z.string().optional(),
  children_names: z.string().optional(),
  has_membership_card: z.boolean().default(false),
  membership_card_issued_at: z.string().optional(),
  status: z.enum(["active", "inactive", "visitor"]).default("active"),
  cell_id: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface MemberFormProps {
  member?: Member;
  cells?: { id: string; name: string }[];
}

const statusOptions = [
  { value: "active", label: "Ativo" },
  { value: "inactive", label: "Inativo" },
  { value: "visitor", label: "Visitante" },
];

export function MemberForm({ member, cells = [] }: MemberFormProps) {
  const router = useRouter();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const { upload, uploading } = useAvatarUpload();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const isEditing = !!member;

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: member
      ? {
          name: member.name,
          cpf: member.cpf ?? "",
          email: member.email ?? "",
          phone: member.phone ?? "",
          address: member.address ?? "",
          birthdate: member.birthdate ?? "",
          baptism_date: member.baptism_date ?? "",
          affiliation_date: member.affiliation_date ?? "",
          education: member.education ?? "",
          profession: member.profession ?? "",
          parents_name: member.parents_name ?? "",
          children_names: member.children_names ?? "",
          has_membership_card: member.has_membership_card ?? false,
          membership_card_issued_at: member.membership_card_issued_at ?? "",
          status: member.status as FormData["status"],
          cell_id: member.cell_id ?? "",
        }
      : { status: "active", cell_id: "", has_membership_card: false },
  });

  const nameValue = watch("name");
  const hasCard = watch("has_membership_card");

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        name: data.name,
        cpf: data.cpf || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        birthdate: data.birthdate || null,
        baptism_date: data.baptism_date || null,
        affiliation_date: data.affiliation_date || null,
        education: data.education || null,
        profession: data.profession || null,
        parents_name: data.parents_name || null,
        children_names: data.children_names || null,
        has_membership_card: data.has_membership_card,
        membership_card_issued_at: data.has_membership_card ? (data.membership_card_issued_at || null) : null,
        status: data.status,
        cell_id: data.cell_id || null,
      };

      if (isEditing) {
        // Atualiza dados primeiro
        await updateMember.mutateAsync({ id: member.id, ...payload });

        // Depois faz upload do avatar se houver arquivo novo
        if (avatarFile) {
          const result = await upload(avatarFile, member.id);
          if (result) {
            await updateMember.mutateAsync({ id: member.id, avatar_url: result.url });
          }
        }
        toast.success("Membro atualizado!");
      } else {
        // Cria membro e depois faz upload do avatar
        const created = await createMember.mutateAsync(payload);

        if (avatarFile && created) {
          const result = await upload(avatarFile, created.id);
          if (result) {
            await updateMember.mutateAsync({ id: created.id, avatar_url: result.url });
          }
        }
        toast.success("Membro cadastrado!");
      }
      router.push("/members");
    } catch {
      toast.error("Erro ao salvar membro");
    }
  };

  const fields = [
    { name: "name", label: "Nome completo *", placeholder: "João da Silva", type: "text" },
    { name: "cpf", label: "CPF", placeholder: "000.000.000-00", type: "text" },
    { name: "email", label: "Email", placeholder: "joao@email.com", type: "email" },
    { name: "phone", label: "Telefone", placeholder: "(11) 99999-9999", type: "tel" },
    { name: "address", label: "Endereço", placeholder: "Rua, número, bairro, cidade", type: "text" },
    { name: "birthdate", label: "Data de nascimento", placeholder: "", type: "date" },
    { name: "baptism_date", label: "Data de batismo", placeholder: "", type: "date" },
    { name: "affiliation_date", label: "Data de filiação", placeholder: "", type: "date" },
    { name: "education", label: "Escolaridade", placeholder: "Ensino médio completo", type: "text" },
    { name: "profession", label: "Profissão", placeholder: "Professor(a)", type: "text" },
    { name: "parents_name", label: "Filiação (pai e mãe)", placeholder: "José da Silva e Maria da Silva", type: "text" },
    { name: "children_names", label: "Filhos", placeholder: "Nomes dos filhos, separados por vírgula", type: "text" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      {/* Avatar */}
      <div className="flex justify-center pb-2">
        <AvatarUpload
          currentUrl={member?.avatar_url}
          name={nameValue}
          onChange={setAvatarFile}
          uploading={uploading}
          size="lg"
        />
      </div>

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

      {cells.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Célula</label>
          <select
            {...register("cell_id")}
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">Nenhuma</option>
            {cells.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="has_membership_card"
          {...register("has_membership_card")}
          className="h-4 w-4 rounded border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="has_membership_card" className="text-sm font-medium">
          Tem carteirinha de membro?
        </label>
      </div>

      {hasCard && (
        <div>
          <label className="block text-sm font-medium mb-1">Data de emissão da carteirinha</label>
          <input
            {...register("membership_card_issued_at")}
            type="date"
            className="w-full px-3 py-2 rounded-lg border bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      )}

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
          disabled={isSubmitting || uploading}
          className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting || uploading ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
        </button>
      </div>
    </form>
  );
}
