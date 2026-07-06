// frontend/src/mocks/generators/obreiros.js
import { mulberry32, nomeBR, int, chance, pick } from '../../lib/seed';

const FUNCOES = ['Porteiro','Recepção','Som','Louvor',' infantil','Limpeza','Segurança','Diácono','Cooperador','Pedido de Oração'];
const DEPT_IDS = ['D_HOMENS','D_MULHERES','D_JOVENS','D_LOUVOR','D_INTERCESSAO','D_EVANGELISMO','D_MISSOES','D_CRIANCAS','D_ADOLESCENTES','D_OUTROS'];

export function gerarObreiros(count = 250, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: `O${(i + 1).toString().padStart(4, '0')}`,
      nome: nomeBR(rng),
      funcao: pick(FUNCOES, rng),
      departamentoId: pick(DEPT_IDS, rng),
      congregacaoId: pick(congsIds, rng),
      escalasCount: int(0, 25, rng),
      participacaoPercent: int(0, 100, rng),
      ativo: chance(0.85, rng),
    });
  }
  return list;
}

export default gerarObreiros;
