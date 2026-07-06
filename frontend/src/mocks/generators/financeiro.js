import { mulberry32, int, dateBetween, pick } from '../../lib/seed';

const CATEGORIAS_ENTRADA = ['Dízimos','Ofertas','Eventos','Aluguel','Doações','Outros'];
const CATEGORIAS_SAIDA = ['Salários','Energia','Água','Manutenção','Eventos','Material','Alimentação','Transporte','Outros'];
const STATUS = ['confirmado','pendente','cancelado'];

export function gerarFinanceiro(count = 500, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const isEntrada = i % 3 !== 0;
    const cat = isEntrada ? pick(CATEGORIAS_ENTRADA, rng) : pick(CATEGORIAS_SAIDA, rng);
    const valor = isEntrada ? int(200, 25000, rng) : int(100, 15000, rng);
    const data = dateBetween(2, 0, rng);
    list.push({
      id: `F${(i + 1).toString().padStart(4, '0')}`,
      tipo: isEntrada ? 'entrada' : 'saida',
      categoria: cat,
      descricao: `${cat} - ${data.toLocaleDateString('pt-BR')}`,
      valor,
      data: data.toISOString().slice(0, 10),
      congregacaoId: pick(congsIds, rng),
      formaPagamento: pick(['Dinheiro','PIX','Cartão Débito','Cartão Crédito','Boleto'], rng),
      status: pick(STATUS, rng),
    });
  }
  return list;
}
