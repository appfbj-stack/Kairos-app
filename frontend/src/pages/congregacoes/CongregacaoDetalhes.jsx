import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Building2, Edit, Trash2, Phone, Mail, MapPin, Users, ArrowLeft, Calendar, User } from 'lucide-react';

function FormCongregacao({ cong, onFechar }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nome: '', endereco: '', cidade: '', estado: 'SP',
    pastor_email: '', telefone: '', whatsapp: '', email: '', status: 'ativa',
    ...cong,
  });

  const salvar = useMutation({
    mutationFn: () => api.put(`/congregacoes/${cong.id}`, form),
    onSuccess: () => { qc.invalidateQueries(['congregacao', cong.id]); qc.invalidateQueries(['congregacoes']); qc.invalidateQueries(['dashboard']); onFechar(); },
  });

  const campo = (name, label, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white w-full lg:max-w-xl lg:rounded-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Editar Congregação</h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="lg:col-span-2">{campo('nome', 'Nome da Congregação *')}</div>
          {campo('endereco', 'Endereço')}
          {campo('cidade', 'Cidade')}
          {campo('estado', 'Estado')}
          {campo('pastor_email', 'E-mail do Pastor', 'email')}
          {campo('telefone', 'Telefone', 'tel')}
          {campo('whatsapp', 'WhatsApp', 'tel')}
          {campo('email', 'E-mail da Congregação', 'email')}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="ativa">Ativa</option>
              <option value="inativa">Inativa</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 p-4 border-t sticky bottom-0 bg-white">
          <button onClick={onFechar} className="flex-1 border rounded-lg py-2 text-sm">Cancelar</button>
          <button onClick={() => salvar.mutate()} disabled={salvar.isPending || !form.nome}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CongregacaoDetalhes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editModal, setEditModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['congregacao', id],
    queryFn: () => api.get(`/congregacoes/${id}`).then(r => r.data),
    enabled: !!id,
  });

  const deletar = useMutation({
    mutationFn: () => api.delete(`/congregacoes/${id}`),
    onSuccess: () => { qc.invalidateQueries(['congregacoes']); qc.invalidateQueries(['dashboard']); navigate('/congregacoes'); },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Building2 size={48} className="mx-auto mb-2 opacity-30" />
        <p>Congregação não encontrada</p>
        <Link to="/congregacoes" className="text-blue-600 text-sm font-medium mt-2 inline-block">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to="/congregacoes" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} /> Voltar para Congregações
      </Link>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Building2 size={28} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{data.nome}</h1>
              <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full font-medium mt-1 ${data.status === 'ativa' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {data.status === 'ativa' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditModal(true)}
              className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:border-blue-300">
              <Edit size={15} /> Editar
            </button>
            <button onClick={() => { if (confirm('Remover congregação?')) deletar.mutate(); }}
              className="flex items-center gap-1.5 border rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:border-red-300">
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Informações</h3>
            {data.endereco && (
              <div>
                <p className="text-xs text-gray-400">Endereço</p>
                <p className="text-sm text-gray-700">{data.endereco}</p>
              </div>
            )}
            {(data.cidade || data.estado) && (
              <div>
                <p className="text-xs text-gray-400">Cidade</p>
                <p className="text-sm text-gray-700 flex items-center gap-1.5"><MapPin size={13} /> {data.cidade}{data.estado ? `, ${data.estado}` : ''}</p>
              </div>
            )}
            {data.telefone && (
              <div>
                <p className="text-xs text-gray-400">Telefone</p>
                <p className="text-sm text-gray-700 flex items-center gap-1.5"><Phone size={13} /> {data.telefone}</p>
              </div>
            )}
            {data.whatsapp && (
              <div>
                <p className="text-xs text-gray-400">WhatsApp</p>
                <p className="text-sm text-gray-700">{data.whatsapp}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contato</h3>
            {data.email && (
              <div>
                <p className="text-xs text-gray-400">E-mail da Congregação</p>
                <p className="text-sm text-gray-700 flex items-center gap-1.5"><Mail size={13} /> {data.email}</p>
              </div>
            )}
            {data.pastor_email && (
              <div>
                <p className="text-xs text-gray-400">E-mail do Pastor</p>
                <p className="text-sm text-gray-700">{data.pastor_email}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-400">Membros</p>
              <p className="text-sm text-gray-700 flex items-center gap-1.5 font-semibold text-blue-600">
                <Users size={15} /> {data.total_membros ?? 0} membros
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/membros"
            className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Gerenciar Membros</p>
              <p className="text-xs text-gray-500">{data.total_membros ?? 0} membros cadastrados</p>
            </div>
          </Link>
          <Link to="/patrimonio"
            className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Building2 size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Patrimônio</p>
              <p className="text-xs text-gray-500">Gerenciar bens e patrimônios</p>
            </div>
          </Link>
        </div>
      </div>

      {editModal && <FormCongregacao cong={data} onFechar={() => setEditModal(false)} />}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Membros desta Congregação</h2>
        <ListaMembros congregacaoId={id} />
      </div>
    </div>
  );
}

function ListaMembros({ congregacaoId }) {
  const { data: membros, isLoading } = useQuery({
    queryKey: ['membros-por-congregacao', congregacaoId],
    queryFn: () => api.get(`/membros?congregacao_id=${congregacaoId}&limit=100`).then(r => r.data),
    enabled: !!congregacaoId,
  });

  if (isLoading) {
    return <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />;
  }

  if (!membros?.dados?.length) {
    return <p className="text-sm text-gray-400 text-center py-4">Nenhum membro cadastrado nesta congregação.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="text-left px-3 py-2 font-medium">Nome</th>
            <th className="text-left px-3 py-2 font-medium">CPF</th>
            <th className="text-left px-3 py-2 font-medium">Telefone</th>
            <th className="text-left px-3 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {membros.dados.map(m => (
            <tr key={m.id} className="border-t hover:bg-gray-50">
              <td className="px-3 py-2.5 flex items-center gap-2">
                <User size={14} className="text-gray-400" />
                <span className="font-medium text-gray-900">{m.nome}</span>
              </td>
              <td className="px-3 py-2.5 text-gray-600">{m.cpf || '—'}</td>
              <td className="px-3 py-2.5 text-gray-600">{m.telefone || '—'}</td>
              <td className="px-3 py-2.5">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  m.status === 'ativo' ? 'bg-green-100 text-green-700' :
                  m.status === 'inativo' ? 'bg-gray-100 text-gray-600' :
                  m.status === 'transferido' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {m.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
