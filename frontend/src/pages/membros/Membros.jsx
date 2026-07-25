import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../../services/api';
import { formatarData, calcularIdade, STATUS_MEMBRO } from '../../lib/utils';
import { Plus, Search, ChevronLeft, ChevronRight, Edit, Trash2, User, Download, ShieldOff, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FormMembro from './FormMembro';

export default function Membros() {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [membroEditando, setMembroEditando] = useState(null);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['membros', busca, status, page],
    queryFn: () => api.get('/membros', { params: { busca, status, page, limit: 20 } }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const deletar = useMutation({
    mutationFn: (id) => api.delete(`/membros/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['membros'] }),
  });

  const exportar = useMutation({
    mutationFn: (id) => api.get(`/membros/${id}/exportar-dados`).then(r => r.data),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `dados-lgpd-${data.dados_pessoais?.nome || 'anonimizado'}.json`;
      a.click(); URL.revokeObjectURL(url);
    },
  });

  const anonimizar = useMutation({
    mutationFn: (id) => api.post(`/membros/${id}/anonimizar`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membros'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); },
  });

  const abrirEdicao = (membro) => { setMembroEditando(membro); setModalAberto(true); };
  const abrirCriacao = () => { setMembroEditando(null); setModalAberto(true); };
  const fecharModal = () => { setModalAberto(false); setMembroEditando(null); };

  const totalPaginas = Math.ceil((data?.total || 0) / 20);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Membros</h1>
          <p className="text-muted-foreground text-sm">{data?.total ?? '...'} registros</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/importacao')}
            className="flex items-center gap-2 border border-border bg-card text-foreground px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium transition-colors">
            <Upload size={16} /> Importar
          </button>
          <button onClick={abrirCriacao}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 text-sm font-medium transition-opacity">
            <Plus size={16} /> Novo Membro
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={16} className="text-muted-foreground" />
          <input
            value={busca}
            onChange={e => { setBusca(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou CPF..."
            className="flex-1 outline-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm outline-none text-foreground focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos os status</option>
          {Object.entries(STATUS_MEMBRO).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data?.dados?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User size={48} className="mx-auto mb-2 opacity-30" />
            <p>Nenhum membro encontrado</p>
          </div>
        ) : (
          <>
            <div className="lg:hidden divide-y divide-border">
              {data?.dados?.map(m => (
                <div key={m.id} className="p-4 flex items-center gap-3">
                  {m.foto_url
                    ? <img src={m.foto_url} alt={m.nome} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                    : <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary flex-shrink-0">{m.nome[0]}</div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">{m.telefone || 'Sem telefone'} • {calcularIdade(m.data_nascimento)} anos</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_MEMBRO[m.status]?.color}`}>
                      {STATUS_MEMBRO[m.status]?.label}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={() => abrirEdicao(m)} className="p-1 text-muted-foreground hover:text-primary"><Edit size={14} /></button>
                      <button onClick={() => exportar.mutate(m.id)} className="p-1 text-muted-foreground hover:text-success" title="Exportar dados"><Download size={14} /></button>
                      {!m.anonimizado_em && <button onClick={() => { if (confirm('Anonimizar dados pessoais deste membro? Esta ação não pode ser desfeita.')) anonimizar.mutate(m.id); }} className="p-1 text-muted-foreground hover:text-warning" title="Anonimizar"><ShieldOff size={14} /></button>}
                      <button onClick={() => { if (confirm('Remover membro?')) deletar.mutate(m.id); }} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <table className="hidden lg:table w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">CPF</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nascimento</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.dados?.map(m => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {m.foto_url
                          ? <img src={m.foto_url} alt={m.nome} className="w-7 h-7 rounded-full object-cover" />
                          : <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{m.nome[0]}</div>
                        }
                        <span className="font-medium text-foreground">{m.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{m.cpf || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatarData(m.data_nascimento)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.telefone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.cargo || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_MEMBRO[m.status]?.color}`}>
                        {STATUS_MEMBRO[m.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => abrirEdicao(m)} className="p-1.5 text-muted-foreground hover:text-primary rounded" title="Editar"><Edit size={15} /></button>
                        <button onClick={() => exportar.mutate(m.id)} className="p-1.5 text-muted-foreground hover:text-success rounded" title="Exportar dados"><Download size={15} /></button>
                        {!m.anonimizado_em && <button onClick={() => { if (confirm('Anonimizar dados pessoais deste membro? Esta ação não pode ser desfeita.')) anonimizar.mutate(m.id); }} className="p-1.5 text-muted-foreground hover:text-warning rounded" title="Anonimizar"><ShieldOff size={15} /></button>}
                        <button onClick={() => { if (confirm('Remover membro?')) deletar.mutate(m.id); }} className="p-1.5 text-muted-foreground hover:text-destructive rounded"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">Página {page} de {totalPaginas}</p>
                <div className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1 rounded disabled:opacity-40 text-foreground hover:bg-accent"><ChevronLeft size={18} /></button>
                  <button disabled={page === totalPaginas} onClick={() => setPage(p => p + 1)} className="p-1 rounded disabled:opacity-40 text-foreground hover:bg-accent"><ChevronRight size={18} /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalAberto && <FormMembro membro={membroEditando} onFechar={fecharModal} />}
    </div>
  );
}
