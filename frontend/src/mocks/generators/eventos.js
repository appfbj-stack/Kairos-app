// frontend/src/mocks/generators/eventos.js
import { mulberry32, int, dateBetween, pick, chance } from '../../lib/seed';

const TIPOS = ['culto','conferência','batismo','retiro','ensaio','encontro','campanha','vigília'];
const TITULOS = ['Culto de Celebração','Encontro de Casais','Conferência de Avivamento','Retiro Espiritual','Batismo nas Águas','Ensaio do Coral','Vigília de Oração','Cruzada Evangelística'];

export function gerarEventos(count = 500, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const data = dateBetween(2, 1, rng);
    const inscritos = int(20, 600, rng);
    const participantes = int(Math.floor(inscritos * 0.7), inscritos, rng);
    const receitas = int(0, 25000, rng);
    const despesas = int(0, 18000, rng);
    list.push({
      id: `E${(i + 1).toString().padStart(4, '0')}`,
      titulo: pick(TITULOS, rng),
      tipo: pick(TIPOS, rng),
      data: data.toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      inscritos,
      participantes,
      receitas,
      despesas,
      fotos: chance(0.4, rng) ? int(3, 18, rng) : 0,
      realizado: data < new Date(),
    });
  }
  return list;
}

export default gerarEventos;
