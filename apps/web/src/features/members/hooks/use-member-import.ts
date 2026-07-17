"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@/lib/supabase/client";

export interface ParsedMemberRow {
  rowNumber: number;
  raw: Record<string, string>;
  name: string;
  cpf?: string;
  email?: string;
  phone?: string;
  address?: string;
  birthdate?: string;
  baptism_date?: string;
  affiliation_date?: string;
  education?: string;
  profession?: string;
  parents_name?: string;
  children_names?: string;
  status: "active" | "inactive" | "visitor";
  cell_name?: string;
  error?: string;
}

const TEMPLATE_HEADERS = [
  "nome",
  "cpf",
  "email",
  "telefone",
  "endereco",
  "nascimento",
  "data_batismo",
  "data_filiacao",
  "escolaridade",
  "profissao",
  "filiacao",
  "filhos",
  "status",
  "celula",
];

const HEADER_MAP: Record<string, string> = {
  nome: "name",
  cpf: "cpf",
  email: "email",
  telefone: "phone",
  endereco: "address",
  nascimento: "birthdate",
  data_nascimento: "birthdate",
  data_batismo: "baptism_date",
  batismo: "baptism_date",
  data_filiacao: "affiliation_date",
  filiacao_data: "affiliation_date",
  escolaridade: "education",
  profissao: "profession",
  filiacao: "parents_name",
  pais: "parents_name",
  filhos: "children_names",
  status: "status",
  celula: "cell_name",
  célula: "cell_name",
};

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectDelimiter(firstLine: string): string {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ";" : ",";
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((c) => c.trim());
}

function toISODate(value?: string): string | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (!v) return undefined;
  // dd/mm/aaaa -> aaaa-mm-dd
  const br = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (br) {
    const [, d, m, y] = br;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const iso = v.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) return v;
  return v;
}

export function parseMembersCSV(text: string): ParsedMemberRow[] {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = cleaned.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const delimiter = detectDelimiter(lines[0]);
  const headers = parseCSVLine(lines[0], delimiter).map(normalizeHeader);

  const rows: ParsedMemberRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    const raw: Record<string, string> = {};
    headers.forEach((h, idx) => {
      raw[h] = cols[idx] ?? "";
    });

    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      const target = HEADER_MAP[key];
      if (target) mapped[target] = value;
    }

    const name = (mapped.name ?? "").trim();
    const statusRaw = (mapped.status ?? "active").trim().toLowerCase();
    const status: ParsedMemberRow["status"] =
      statusRaw === "inativo" || statusRaw === "inactive"
        ? "inactive"
        : statusRaw === "visitante" || statusRaw === "visitor"
          ? "visitor"
          : "active";

    const row: ParsedMemberRow = {
      rowNumber: i + 1,
      raw,
      name,
      cpf: mapped.cpf || undefined,
      email: mapped.email || undefined,
      phone: mapped.phone || undefined,
      address: mapped.address || undefined,
      birthdate: toISODate(mapped.birthdate),
      baptism_date: toISODate(mapped.baptism_date),
      affiliation_date: toISODate(mapped.affiliation_date),
      education: mapped.education || undefined,
      profession: mapped.profession || undefined,
      parents_name: mapped.parents_name || undefined,
      children_names: mapped.children_names || undefined,
      status,
      cell_name: mapped.cell_name || undefined,
    };

    if (!name) {
      row.error = "Nome é obrigatório";
    }

    rows.push(row);
  }

  return rows;
}

export function downloadMembersTemplate() {
  const header = TEMPLATE_HEADERS.join(",");
  const example =
    "João da Silva,123.456.789-00,joao@email.com,(11) 99999-9999,Rua das Flores 123,15/03/1985,20/12/2005,10/01/2010,Ensino médio completo,Professor,José da Silva e Maria da Silva,\"Pedro, Ana\",active,";
  const csv = "\uFEFF" + header + "\n" + example + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-importacao-membros.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ImportResult {
  importId: string;
  successCount: number;
  errorCount: number;
}

export function useImportMembers() {
  const supabase = createBrowserClient();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({
      rows,
      fileName,
      cells,
    }: {
      rows: ParsedMemberRow[];
      fileName: string;
      cells: { id: string; name: string }[];
    }): Promise<ImportResult> => {
      setProgress(0);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("users")
        .select("church_id, congregation_id")
        .eq("id", user.id)
        .single();
      if (!profile?.church_id) throw new Error("Perfil não encontrado");

      const { data: importRow, error: importError } = await supabase
        .from("member_imports")
        .insert({
          church_id: profile.church_id,
          congregation_id: profile.congregation_id ?? null,
          imported_by: user.id,
          file_name: fileName,
          total_rows: rows.length,
          success_count: 0,
          error_count: 0,
          status: "processing",
        })
        .select()
        .single();
      if (importError || !importRow) throw importError ?? new Error("Erro ao iniciar importação");

      let successCount = 0;
      let errorCount = 0;
      const errorLogs: { import_id: string; row_number: number; raw_data: Record<string, string>; error_message: string }[] = [];

      const cellsByName = new Map(cells.map((c) => [c.name.trim().toLowerCase(), c.id]));

      const chunkSize = 10;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        await Promise.all(
          chunk.map(async (row) => {
            if (row.error) {
              errorCount++;
              errorLogs.push({
                import_id: importRow.id,
                row_number: row.rowNumber,
                raw_data: row.raw,
                error_message: row.error,
              });
              return;
            }
            const cell_id = row.cell_name ? cellsByName.get(row.cell_name.trim().toLowerCase()) ?? null : null;
            const { error } = await supabase.from("members").insert({
              church_id: profile.church_id,
              created_by: user.id,
              name: row.name,
              cpf: row.cpf ?? null,
              email: row.email ?? null,
              phone: row.phone ?? null,
              address: row.address ?? null,
              birthdate: row.birthdate ?? null,
              baptism_date: row.baptism_date ?? null,
              affiliation_date: row.affiliation_date ?? null,
              education: row.education ?? null,
              profession: row.profession ?? null,
              parents_name: row.parents_name ?? null,
              children_names: row.children_names ?? null,
              status: row.status,
              cell_id,
            });
            if (error) {
              errorCount++;
              errorLogs.push({
                import_id: importRow.id,
                row_number: row.rowNumber,
                raw_data: row.raw,
                error_message: error.message,
              });
            } else {
              successCount++;
            }
          })
        );
        setProgress(Math.min(100, Math.round(((i + chunk.length) / rows.length) * 100)));
      }

      if (errorLogs.length > 0) {
        await supabase.from("member_import_errors").insert(errorLogs);
      }

      await supabase
        .from("member_imports")
        .update({
          success_count: successCount,
          error_count: errorCount,
          status: "completed",
        })
        .eq("id", importRow.id);

      return { importId: importRow.id, successCount, errorCount };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });

  return { ...mutation, progress };
}
