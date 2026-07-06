import { mulberry32, int, pick, dateBetween } from '../../lib/seed';

const CATEGORIAS = ['Móveis','Eletrônicos','Instrumentos Musicais','Veículos','Imóveis','Equipamentos','Outros'];
const ESTADOS = ['novo','bom','regular','danificado'];

export function gerarPatrimonio(count = 150, seed = 12345) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `PT${(i + 1).toString().padStart(4, '0')}`,
    nome: `Item ${pick(CATEGORIAS, rng)} #${i + 1}`,
    categoria: pick(CATEGORIAS, rng),
    estado: pick(ESTADOS, rng),
    valor: int(100, 50000, rng),
    dataAquisicao: dateBetween(20, 0, rng).toISOString().slice(0, 10),
    localizacao: pick(['Sede','Filial A','Filial B','Galpão','Depósito'], rng),
  }));
}
