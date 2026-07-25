import { mulberry32, int, pick, dateBetween } from '../../lib/seed';

const STATUS = ['planejado','em_andamento','concluido','pausado','cancelado'];
const CATEGORIAS = ['Construção','Reforma','Evento','Ação Social','Missão','Infraestrutura','Outros'];

export function gerarProjetos(count = 60, seed = 12345) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const inicio = dateBetween(5, 0, rng);
    const fim = dateBetween(0, 2, rng);
    return {
      id: `PJ${(i + 1).toString().padStart(3, '0')}`,
      nome: `Projeto ${pick(['Renovação','Crescimento','Expansão','Missões','Ação Social','Construção'], rng)} ${i + 1}`,
      categoria: pick(CATEGORIAS, rng),
      status: pick(STATUS, rng),
      inicio: inicio.toISOString().slice(0, 10),
      previsaoTermino: fim.toISOString().slice(0, 10),
      orcamento: int(5000, 200000, rng),
      gastoAte: int(1000, 150000, rng),
      responsavel: `Responsável ${i + 1}`,
    };
  });
}
