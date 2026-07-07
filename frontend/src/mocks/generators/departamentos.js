// frontend/src/mocks/generators/departamentos.js
import { mulberry32, int, chance, pick } from '../../lib/seed';

const NOMES = ['Homens','Mulheres','Jovens','Adolescentes','Crianças','Louvor','Intercessão','Evangelismo','Missões','Outros'];
const TIPOS = ['musica','ensino','social','adm','ensino','musica','social','ensino','adm','ensino'];

export function gerarDepartamentos(count = 50, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const nome = pick(NOMES, rng);
    list.push({
      id: `D_${(i + 1).toString().padStart(3, '0')}`,
      nome,
      tipo: pick(TIPOS, rng),
      congregacaoId: pick(congsIds, rng),
      liderId: `O${int(1, 250, rng).toString().padStart(4, '0')}`,
      membrosCount: int(5, 80, rng),
      eventos12m: int(0, 18, rng),
      ativo: chance(0.8, rng),
    });
  }
  return list;
}

export default gerarDepartamentos;
