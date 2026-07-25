import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { X, Upload, Shield } from 'lucide-react';

const CAMPOS = [
  { name: 'nome', label: 'Nome completo *', type: 'text', required: true },
  { name: 'cpf', label: 'CPF', type: 'text', mask: 'cpf' },
  { name: 'rg', label: 'RG', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'data_nascimento', label: 'Data de nascimento', type: 'date' },
  { name: 'telefone', label: 'Telefone', type: 'tel' },
  { name: 'whatsapp', label: 'WhatsApp', type: 'tel' },
  { name: 'endereco', label: 'Endereço', type: 'text' },
  { name: 'estado_civil', label: 'Estado civil', type: 'select', opcoes: ['solteiro', 'casado', 'divorciado', 'viuvo'] },
  { name: 'escolaridade', label: 'Escolaridade', type: 'text' },
  { name: 'profissao', label: 'Profissão', type: 'text' },
  { name: 'data_conversao', label: 'Data de conversão', type: 'date' },
  { name: 'data_batismo', label: 'Data de batismo', type: 'date' },
  { name: 'data_filiacao', label: 'Data de filiação', type: 'date' },
  { name: 'cargo', label: 'Cargo', type: 'text' },
  { name: 'nome_pai', label: 'Nome do Pai', type: 'text' },
  { name: 'nome_mae', label: 'Nome da Mãe', type: 'text' },
  { name: 'filhos', label: 'Filhos', type: 'textarea' },
  { name: 'status', label: 'Status', type: 'select', opcoes: ['ativo', 'inativo', 'transferido', 'falecido'], required: true },
  { name: 'observacoes', label: 'Observações', type: 'textarea' },
];

export default function FormMembro({ membro, onFechar }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nome: '', cpf: '', rg: '', email: '', data_nascimento: '', telefone: '',
    whatsapp: '', endereco: '', estado_civil: '', escolaridade: '',
    profissao: '', data_conversao: '', data_batismo: '', data_filiacao: '',
    cargo: '', nome_pai: '', nome_mae: '', filhos: '',
    status: 'ativo', observacoes: '', congregacao_id: '',
    consentimento_lgpd: false, has_membership_card: false,
    membership_card_issued_at: '', lgpd_autorizacao_imagem: false,
    lgpd_autorizacao_comunicacao: false,
    ...membro,
  });
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(membro?.foto_url || null);

  const { data: congregacoes } = useQuery({
    queryKey: ['congregacoes'],
    queryFn: () => api.get('/congregacoes').then(r => r.data),
  });

  const salvar = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
      fd.set('consentimento_lgpd', form.consentimento_lgpd ? 'true' : 'false');
      fd.set('has_membership_card', form.has_membership_card ? 'true' : 'false');
      fd.set('lgpd_autorizacao_imagem', form.lgpd_autorizacao_imagem ? 'true' : 'false');
      fd.set('lgpd_autorizacao_comunicacao', form.lgpd_autorizacao_comunicacao ? 'true' : 'false');
      if (foto) fd.append('foto', foto);
      if (membro?.id) return api.put(`/membros/${membro.id}`, fd);
      return api.post('/membros', fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['membros'] }); qc.invalidateQueries({ queryKey: ['dashboard'] }); onFechar(); },
  });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-white w-full lg:max-w-2xl lg:rounded-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{membro ? 'Editar' : 'Novo'} Membro</h2>
          <button onClick={onFechar} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
              {fotoPreview
                ? <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                : <span className="text-3xl text-gray-300">👤</span>
              }
            </div>
            <label className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg cursor-pointer text-sm">
              <Upload size={16} /> Foto
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
          </div>

          {congregacoes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Congregação *</label>
              <select value={form.congregacao_id} onChange={e => setForm(f => ({ ...f, congregacao_id: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">Selecione...</option>
                {congregacoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {CAMPOS.map(({ name, label, type, required, opcoes }) => (
              <div key={name} className={type === 'textarea' || name === 'nome' ? 'lg:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                {type === 'select' ? (
                  <select value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="">Selecione...</option>
                    {opcoes.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1).replace('_', ' ')}</option>)}
                  </select>
                ) : type === 'textarea' ? (
                  <textarea value={form[name]} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    rows={3} className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
                ) : (
                  <input type={type} value={form[name]} required={required}
                    onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Carteirinha de Membro</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="has_membership_card" checked={form.has_membership_card}
                onChange={e => setForm(f => ({ ...f, has_membership_card: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label htmlFor="has_membership_card" className="text-sm text-gray-700">Tem carteirinha de membro?</label>
            </div>
            {form.has_membership_card && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de emissão</label>
                <input type="date" value={form.membership_card_issued_at}
                  onChange={e => setForm(f => ({ ...f, membership_card_issued_at: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">LGPD - Consentimento de Dados</h3>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)
            </p>
            <div className="space-y-3 bg-gray-50 rounded-lg p-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.consentimento_lgpd}
                  onChange={e => setForm(f => ({ ...f, consentimento_lgpd: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Consentimento de dados</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Autorizo o armazenamento e tratamento dos meus dados pessoais para fins de gestão eclesiástica, conforme a LGPD.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.lgpd_autorizacao_imagem}
                  onChange={e => setForm(f => ({ ...f, lgpd_autorizacao_imagem: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Autorização de imagem</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Autorizo o uso da minha imagem em materiais internos da igreja e redes sociais.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.lgpd_autorizacao_comunicacao}
                  onChange={e => setForm(f => ({ ...f, lgpd_autorizacao_comunicacao: e.target.checked }))}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Autorização de comunicação</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Autorizo o envio de comunicações sobre eventos, atividades e informativos da igreja.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
          <button onClick={onFechar} className="flex-1 border rounded-lg py-2 text-sm font-medium hover:bg-gray-50">Cancelar</button>
          <button
            onClick={() => salvar.mutate()}
            disabled={salvar.isPending || !form.nome}
            className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {salvar.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
