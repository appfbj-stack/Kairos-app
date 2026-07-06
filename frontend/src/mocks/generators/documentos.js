// frontend/src/mocks/generators/documentos.js
import { mulberry32, dateBetween, pick } from '../../lib/seed';

const TIPOS = ['ata','relatório','certificado','carta','ofício','regimento'];
const TITULOS = ['Ata de Reunião','Relatório Mensal','Certificado de Batismo','Carta de Recomendação','Ofício','Regimento Interno'];

export function gerarDocumentos(count = 300, seed = 55555, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `DOC${(i + 1).toString().padStart(4, '0')}`,
      titulo: `${pick(TITULOS, rng)} #${i + 1}`,
      tipo: pick(TIPOS, rng),
      congregacaoId: pick(congsIds, rng),
      data: dateBetween(5, 0, rng).toISOString().slice(0, 10),
      autor: `Pastor ${Math.floor(Math.random() * 80) + 1}`,
    });
  }
  return list;
}

export default gerarDocumentos;
