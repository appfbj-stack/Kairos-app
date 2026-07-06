// frontend/src/mocks/generators/pastores.js
import { mulberry32, nomeBR, telefoneBR, int, dateBetween, chance, pick } from '../../lib/seed';

const FORMACOES = ['Bacharel em Teologia','Licenciatura em Teologia','Mestrado em Teologia','Doutorado em Teologia','Sem formação formal'];

export function gerarPastores(count = 80, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const sexo = chance(0.85, rng) ? 'M' : 'F';
    list.push({
      id: `P${(i + 1).toString().padStart(3, '0')}`,
      nome: nomeBR(rng),
      telefone: telefoneBR(rng),
      email: `pastor${i + 1}@igreja.org`,
      sexo,
      dataNasc: dateBetween(60, 25, rng).toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      tempoMinisterio: int(2, 40, rng),
      formacao: pick(FORMACOES, rng),
      ativoDesde: dateBetween(40, 0, rng).toISOString().slice(0, 10),
    });
  }
  return list;
}

export default gerarPastores;
