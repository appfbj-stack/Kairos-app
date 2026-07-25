import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';

function FormConhecimento({ item, onFechar }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    titulo: '', pergunta: '', resposta: '', categoria: '', tags: '',
    video_url: '', imagem_url: '', ativo: true,
    ...item,
  });

  const salvar = useMutation({
    mutationFn: () => {
      const payload = { ...form };
      if (item?.id) delete payload.id;
      return item?.id
        ? api.put(`/admin/assistente-conhecimento/${item.id}`, payload)
        : api.post('/admin/assistente-conhecimento', payload);
    },
    onSuccess: () => { qc.invalidateQueries(['assistente-conhecimento']); onFechar(); },
  });

  const campo = (name, label, type = 'text', opts = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 min-h-[80px]" rows={3} />
      ) : (
        <input type={type} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" {...opts} />
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white w-full lg:max-w-2xl lg:rounded-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{item?.id ? 'Editar' : 'Novo'} Conhecimento</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="lg:col-span-2">{campo('titulo', 'Título *')}</div>
          <div className="lg:col-span-2">{campo('pergunta', 'Pergunta *', 'textarea')}</div>
          <div className="lg:col-span-2">{campo('resposta', 'Resposta *', 'textarea')}</div>
          {campo('categoria', 'Categoria')}
          {campo('tags', 'Tags (separadas por vírgula)')}
          {campo('video_url', 'URL do Vídeo', 'url')}
          {campo('imagem_url', 'URL da Imagem', 'url')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ativo</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-600">{form.ativo ? 'Sim' : 'Não'}</span>
            </label>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t sticky bottom-0 bg-white">
          <button onClick={onFechar} className="flex-1 border rounded-lg py-2 text-sm">Cancelar</button>
          <button onClick={() => salvar.mutate()} disabled={salvar.isPending || !form.titulo || !form.pergunta || !form.resposta}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AssistenteConfig() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [formAberto, setFormAberto] = useState(null);
  const [expandido, setExpandido] = useState(null);

  const { data: registros = [], isLoading } = useQuery({
    queryKey: ['assistente-conhecimento', busca, filtroCategoria],
    queryFn: () => api.get('/admin/assistente-conhecimento', {
      params: { busca: busca || undefined, categoria: filtroCategoria || undefined },
    }).then(r => r.data),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['assistente-conhecimento-categorias'],
    queryFn: () => api.get('/admin/assistente-conhecimento/categorias').then(r => r.data),
  });

  const deletar = useMutation({
    mutationFn: (id) => api.delete(`/admin/assistente-conhecimento/${id}`),
    onSuccess: () => qc.invalidateQueries(['assistente-conhecimento']),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assistente</h1>
          <p className="text-gray-500 text-sm">{registros.length} perguntas cadastradas</p>
        </div>
        <button onClick={() => setFormAberto({})}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          <Plus size={16} /> Nova Pergunta
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar perguntas..." value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm outline-none focus:border-blue-500" />
        </div>
        {categorias.length > 0 && (
          <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : registros.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Nenhuma pergunta cadastrada</p>
          <p className="text-sm mt-1">Adicione perguntas e respostas para o assistente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {registros.map(r => (
            <div key={r.id} className="bg-white rounded-xl border overflow-hidden">
              <button onClick={() => setExpandido(expandido === r.id ? null : r.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.titulo}</p>
                    <p className="text-xs text-gray-500 truncate">{r.pergunta}</p>
                  </div>
                  {r.categoria && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0 hidden sm:inline-block">{r.categoria}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <button onClick={(e) => { e.stopPropagation(); setFormAberto(r); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit size={15} /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Remover este conhecimento?')) deletar.mutate(r.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={15} /></button>
                  {expandido === r.id ? <EyeOff size={15} className="text-gray-400" /> : <Eye size={15} className="text-gray-400" />}
                </div>
              </button>
              {expandido === r.id && (
                <div className="px-4 pb-4 border-t pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Pergunta</p>
                    <p className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{r.pergunta}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Resposta</p>
                    <p className="text-sm text-gray-800 bg-blue-50 rounded-lg p-3 whitespace-pre-wrap">{r.resposta}</p>
                  </div>
                  {(r.tags || r.video_url || r.imagem_url) && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {r.tags && <p><span className="font-medium">Tags:</span> {r.tags}</p>}
                      {r.video_url && (
                        <a href={r.video_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline">
                          <ExternalLink size={12} /> Vídeo
                        </a>
                      )}
                      {r.imagem_url && (
                        <a href={r.imagem_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline">
                          <ExternalLink size={12} /> Imagem
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {r.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                    {r.categoria && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{r.categoria}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formAberto !== null && <FormConhecimento item={formAberto?.id ? formAberto : null} onFechar={() => setFormAberto(null)} />}
    </div>
  );
}
