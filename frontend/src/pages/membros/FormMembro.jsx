import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { X, Upload, Shield, Image as ImageIcon } from 'lucide-react';

function maskCPF(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}

const STATUS_OPCOES = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'visitante', label: 'Visitante' },
  { value: 'transferido', label: 'Transferido' },
];

export default function FormMembro({ membro, onFechar }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    nome: '', cpf: '', email: '', telefone: '', endereco: '',
    data_nascimento: '', data_batismo: '', data_filiacao: '',
    escolaridade: '', profissao: '', nome_pai: '', nome_mae: '',
    filhos: '', estado_civil: '', cargo: '', status: 'ativo',
    congregacao_id: '',
    has_membership_card: false, membership_card_issued_at: '',
    consentimento_lgpd: false, lgpd_finalidade: '',
    lgpd_autorizacao_imagem: false, lgpd_autorizacao_comunicacao: false,
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
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
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

  const handleChange = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [key]: val }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
      <div className="bg-card w-full lg:max-w-2xl lg:rounded-xl border border-border max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">{membro ? 'Editar' : 'Novo'} Membro</h2>
          <button onClick={onFechar} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center shrink-0">
              {fotoPreview
                ? <img src={fotoPreview} alt="Foto" className="w-full h-full object-cover" />
                : <ImageIcon className="w-8 h-8 text-muted-foreground" />
              }
            </div>
            <label className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-2 rounded-lg cursor-pointer text-sm font-medium hover:bg-accent transition-colors">
              <Upload size={16} /> Foto
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
            </label>
          </div>

          {congregacoes && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Congregação *</label>
              <select value={form.congregacao_id} onChange={handleChange('congregacao_id')}
                className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring">
                <option value="">Selecione...</option>
                {congregacoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Nome completo *</label>
              <input type="text" value={form.nome} onChange={handleChange('nome')} required
                className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring" />
            </div>

            <InputField label="CPF" value={maskCPF(form.cpf)} onChange={(v) => setForm(f => ({...f, cpf: v}))} placeholder="000.000.000-00" />
            <InputField label="Email" type="email" value={form.email} onChange={handleChange('email')} placeholder="joao@email.com" />
            <InputField label="Telefone" value={maskPhone(form.telefone)} onChange={(v) => setForm(f => ({...f, telefone: v}))} placeholder="(11) 99999-9999" />
            <div className="lg:col-span-2">
              <InputField label="Endereço" value={form.endereco} onChange={handleChange('endereco')} placeholder="Rua, número, bairro, cidade" />
            </div>

            <InputField label="Data de nascimento" type="date" value={form.data_nascimento} onChange={handleChange('data_nascimento')} />
            <InputField label="Estado civil" value={form.estado_civil} onChange={handleChange('estado_civil')} placeholder="Solteiro(a)" />
            <InputField label="Data de batismo" type="date" value={form.data_batismo} onChange={handleChange('data_batismo')} />
            <InputField label="Data de filiação" type="date" value={form.data_filiacao} onChange={handleChange('data_filiacao')} />
            <InputField label="Escolaridade" value={form.escolaridade} onChange={handleChange('escolaridade')} placeholder="Ensino médio completo" />
            <InputField label="Profissão" value={form.profissao} onChange={handleChange('profissao')} placeholder="Professor(a)" />
            <InputField label="Nome do Pai" value={form.nome_pai} onChange={handleChange('nome_pai')} placeholder="Nome completo do pai" />
            <InputField label="Nome da Mãe" value={form.nome_mae} onChange={handleChange('nome_mae')} placeholder="Nome completo da mãe" />
            <div className="lg:col-span-2">
              <InputField label="Filhos" value={form.filhos} onChange={handleChange('filhos')} placeholder="Nomes dos filhos, separados por vírgula" />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select value={form.status} onChange={handleChange('status')}
                className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring">
                {STATUS_OPCOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cargo</label>
              <input type="text" value={form.cargo} onChange={handleChange('cargo')} placeholder="Ex: Diácono, Presbítero"
                className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Carteirinha de Membro</h3>
            <div className="flex items-center gap-2 mb-3">
              <input type="checkbox" id="has_membership_card" checked={form.has_membership_card}
                onChange={handleChange('has_membership_card')}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
              <label htmlFor="has_membership_card" className="text-sm text-foreground">Tem carteirinha de membro?</label>
            </div>
            {form.has_membership_card && (
              <InputField label="Data de emissão" type="date" value={form.membership_card_issued_at} onChange={handleChange('membership_card_issued_at')} />
            )}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">LGPD - Consentimento de Dados</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)
            </p>
            <div className="space-y-3 bg-muted/50 rounded-lg p-4">
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.consentimento_lgpd}
                  onChange={handleChange('consentimento_lgpd')}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                <div>
                  <span className="text-sm font-medium text-foreground">Consentimento de dados</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Autorizo o armazenamento e tratamento dos meus dados pessoais para fins de gestão eclesiástica, conforme a LGPD.
                  </p>
                </div>
              </label>

              {form.consentimento_lgpd && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Finalidade do tratamento</label>
                  <textarea value={form.lgpd_finalidade} onChange={handleChange('lgpd_finalidade')}
                    rows={2} placeholder="Ex: Cadastro de membresia, comunicação de eventos, gestão administrativa"
                    className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              )}

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.lgpd_autorizacao_imagem}
                  onChange={handleChange('lgpd_autorizacao_imagem')}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                <div>
                  <span className="text-sm font-medium text-foreground">Autorização de imagem</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Autorizo o uso da minha imagem em materiais internos da igreja e redes sociais.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.lgpd_autorizacao_comunicacao}
                  onChange={handleChange('lgpd_autorizacao_comunicacao')}
                  className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-ring" />
                <div>
                  <span className="text-sm font-medium text-foreground">Autorização de comunicação</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Autorizo o envio de comunicações sobre eventos, atividades e informativos da igreja.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border sticky bottom-0 bg-card">
          <button onClick={onFechar}
            className="flex-1 border border-input rounded-lg py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => salvar.mutate()}
            disabled={salvar.isPending || !form.nome}
            className="flex-1 bg-primary text-primary-foreground rounded-lg py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {salvar.isPending ? 'Salvando...' : membro ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, type = 'text', value, onChange, placeholder, className }) {
  const handleInput = (e) => {
    if (typeof onChange === 'function' && onChange.length === 1) {
      onChange(e.target.value);
    } else {
      onChange(e);
    }
  };
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input type={type} value={value} onChange={handleInput} placeholder={placeholder}
        className="w-full border border-input bg-card text-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring focus:border-ring" />
    </div>
  );
}
