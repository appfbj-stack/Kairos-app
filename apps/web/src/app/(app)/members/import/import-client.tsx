"use client";

import { useRef, useState } from "react";
import { Upload, Download, FileWarning, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  parseMembersCSV,
  downloadMembersTemplate,
  useImportMembers,
  type ParsedMemberRow,
} from "@/features/members/hooks/use-member-import";

interface ImportMembersClientProps {
  cells: { id: string; name: string }[];
}

const statusLabels: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  visitor: "Visitante",
};

export function ImportMembersClient({ cells }: ImportMembersClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ParsedMemberRow[]>([]);
  const [result, setResult] = useState<{ successCount: number; errorCount: number } | null>(null);
  const importMembers = useImportMembers();

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  const handleFile = async (file: File) => {
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseMembersCSV(text);
    setRows(parsed);
    if (parsed.length === 0) {
      toast.error("Não encontramos nenhuma linha válida nesse arquivo");
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const handleConfirm = async () => {
    if (validRows.length === 0) {
      toast.error("Nenhum membro válido para importar");
      return;
    }
    try {
      const res = await importMembers.mutateAsync({ rows, fileName: fileName ?? "importacao.csv", cells });
      setResult(res);
      if (res.errorCount === 0) {
        toast.success(`${res.successCount} membros importados com sucesso!`);
      } else {
        toast.success(`${res.successCount} importados, ${res.errorCount} com erro`);
      }
    } catch {
      toast.error("Erro ao importar membros");
    }
  };

  const reset = () => {
    setFileName(null);
    setRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (result) {
    return (
      <div className="flex flex-col items-center text-center py-8 space-y-4">
        <div className="rounded-full bg-green-500/10 p-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Importação concluída</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {result.successCount} membro(s) importado(s) com sucesso
            {result.errorCount > 0 ? `, ${result.errorCount} com erro` : ""}.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
          >
            Importar outro arquivo
          </button>
          <button
            onClick={() => router.push("/members")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Ver membros
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Upload className="w-4 h-4" />
          Selecionar arquivo CSV
        </button>
        <button
          type="button"
          onClick={() => downloadMembersTemplate()}
          className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar modelo CSV
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFileInputChange}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        O arquivo deve ter as colunas: nome, cpf, email, telefone, endereco, nascimento, data_batismo,
        data_filiacao, escolaridade, profissao, filiacao, filhos, status, celula. Apenas o nome é obrigatório.
      </p>

      {fileName && rows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">{fileName}</span>
            <span className="text-muted-foreground">{rows.length} linha(s) encontrada(s)</span>
            <span className="text-green-600">{validRows.length} válida(s)</span>
            {invalidRows.length > 0 && (
              <span className="text-destructive flex items-center gap-1">
                <FileWarning className="w-3.5 h-3.5" />
                {invalidRows.length} com erro
              </span>
            )}
          </div>

          <div className="rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Linha</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden md:table-cell">Telefone</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Situação</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber} className={`border-t ${row.error ? "bg-destructive/5" : ""}`}>
                    <td className="px-3 py-2 text-muted-foreground">{row.rowNumber}</td>
                    <td className="px-3 py-2 font-medium">{row.name || "—"}</td>
                    <td className="px-3 py-2 hidden sm:table-cell text-muted-foreground">{row.email ?? "—"}</td>
                    <td className="px-3 py-2 hidden md:table-cell text-muted-foreground">{row.phone ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">{statusLabels[row.status]}</td>
                    <td className="px-3 py-2">
                      {row.error ? (
                        <span className="text-destructive text-xs">{row.error}</span>
                      ) : (
                        <span className="text-green-600 text-xs">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {importMembers.isPending && (
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${importMembers.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Importando... {importMembers.progress}%</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={importMembers.isPending}
              className="flex-1 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={importMembers.isPending || validRows.length === 0}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {importMembers.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importando...
                </>
              ) : (
                `Importar ${validRows.length} membro(s)`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
