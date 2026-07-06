// frontend/src/mocks/generators/escalas.js
import { mulberry32, int, dateBetween, pick } from '../../lib/seed';

const DEPT_IDS = ['D_HOMENS','D_MULHERES','D_JOVENS','D_LOUVOR','D_INTERCESSAO','D_EVANGELISMO','D_MISSOES','D_CRIANCAS'];

export function gerarEscalas(count = 200, seed = 99999, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const obreirosIds = Array.from({ length: int(3, 12, rng) }, () => `O${int(1, 250, rng).toString().padStart(4, '0')}`);
    list.push({
      id: `ES${(i + 1).toString().padStart(4, '0')}`,
      data: dateBetween(1, 1, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      departamentoId: pick(DEPT_IDS, rng),
      obreiros: obreirosIds,
      status: pick(['pendente','confirmada','realizada','cancelada'], rng),
      confirmados: int(0, obreirosIds.length, rng),
      ausencias: int(0, Math.floor(obreirosIds.length / 2), rng),
      trocas: int(0, 3, rng),
    });
  }
  return list;
}

export default gerarEscalas;
