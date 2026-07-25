import api from './api';

export async function analisarArquivo(arquivo, congregacaoId) {
  const form = new FormData();
  form.append('arquivo', arquivo);
  form.append('congregacao_id', congregacaoId);
  const { data } = await api.post('/importacao/analisar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

export async function obterPreview({ sessaoId, mapeamento, congregacaoId }) {
  const { data } = await api.post('/importacao/preview', {
    sessao_id: sessaoId,
    mapeamento,
    congregacao_id: congregacaoId,
  });
  return data;
}

export async function executarImportacao({ sessaoId, mapeamento, congregacaoId, decisoesDuplicados }) {
  const { data } = await api.post('/importacao/executar', {
    sessao_id: sessaoId,
    mapeamento,
    congregacao_id: congregacaoId,
    decisoes_duplicados: decisoesDuplicados || {},
  }, { timeout: 120000 });
  return data;
}

export async function obterHistorico() {
  const { data } = await api.get('/importacao/historico');
  return data;
}

export async function desfazerImportacao(importacaoId) {
  const { data } = await api.post(`/importacao/desfazer/${importacaoId}`);
  return data;
}

export async function agendarImportacao(arquivo, congregacaoId, mapeamento = null) {
  const form = new FormData();
  form.append('arquivo', arquivo);
  form.append('congregacao_id', congregacaoId);
  if (mapeamento) {
    form.append('mapeamento_json', JSON.stringify(mapeamento));
  }
  const { data } = await api.post('/importacao/agendar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
  });
  return data;
}

export async function obterStatusImportacao(importacaoId) {
  const { data } = await api.get(`/importacao/${importacaoId}/status`);
  return data;
}
