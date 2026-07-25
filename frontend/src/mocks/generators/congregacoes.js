// frontend/src/mocks/generators/congregacoes.js
import { mulberry32, pick, int, dateBetween } from '../../lib/seed';

const NOMES_CONGREGACAO = [
  'Central','Bethesda','Sião','Filadélfia','Betel','Manaim','Peniel','Gilgal','Refúgio','Aliança',
  'Graça','Esperança','Vida','Luz','Paz','Fé','Amor','Restauração','Avivamento','Salvação',
].map((n) => `Igreja ${n}`);

export function gerarCongregacoes(count = 35, seed = 12345) {
  const rng = mulberry32(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const [cidade, uf] = pick([
      ['São Paulo','SP'],['Rio de Janeiro','RJ'],['Belo Horizonte','MG'],['Curitiba','PR'],['Salvador','BA'],
      ['Sorocaba','SP'],['Campinas','SP'],['Niterói','RJ'],['Londrina','PR'],['Feira de Santana','BA'],
    ], rng);
    const pastorId = `P${int(1, 80, rng).toString().padStart(3, '0')}`;
    const crescimento12m = Array.from({ length: 12 }, () => int(2, 25, rng));
    const batismos12m = Array.from({ length: 12 }, () => int(0, 8, rng));
    const visitantes12m = Array.from({ length: 12 }, () => int(5, 60, rng));
    const entradas = int(8000, 80000, rng);
    const saidas = int(4000, 60000, rng);
    list.push({
      id: `C${(i + 1).toString().padStart(3, '0')}`,
      nome: `${pick(NOMES_CONGREGACAO, rng)} - ${cidade}`,
      cidade, uf,
      endereco: `Rua ${pick(['das Flores','dos Ipês','das Palmeiras','Sete de Setembro','Primeiro de Março','Tapajós','Acre'], rng)}, ${int(10, 999, rng)}`,
      pastorId,
      membrosCount: int(40, 480, rng),
      fundadaEm: dateBetween(50, 2, rng),
      crescimento12m,
      batismos12m,
      visitantes12m,
      departamentosAtivos: int(3, 9, rng),
      financeiro: { entradas, saidas, saldo: entradas - saidas },
      batismos12mTotal: batismos12m.reduce((a, b) => a + b, 0),
    });
  }
  return list;
}

export default gerarCongregacoes;
