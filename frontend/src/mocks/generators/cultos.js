// frontend/src/mocks/generators/cultos.js
import { mulberry32, int, dateBetween, pick } from '../../lib/seed';

const TEMAS = ['Esperança','Fé','Salvação','Amor','Restauração','Avivamento','Graça','Santidade','Comunhão','Missões','Família'];

export function gerarCultos(count = 1000, seed = 12345, congregacoesIds = [], pastores = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const pregadores = pastores.length ? pastores.map((p) => p.nome) : Array.from({ length: 80 }, (_, i) => `Pastor ${i + 1}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const participantes = int(30, 500, rng);
    list.push({
      id: `CU${(i + 1).toString().padStart(5, '0')}`,
      data: dateBetween(2, 1, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      pregador: pick(pregadores, rng),
      participantes,
      visitantes: int(0, Math.floor(participantes * 0.15), rng),
      decisoes: int(0, 20, rng),
      batismos: int(0, 5, rng),
      tema: pick(TEMAS, rng),
    });
  }
  return list;
}

export default gerarCultos;
