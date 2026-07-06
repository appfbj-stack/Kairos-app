import { mulberry32, int, pick } from '../../lib/seed';

const CATEGORIAS = ['Teologia','História da Igreja','Devocional','Família','Liderança','Juvenil','Infantil','Biografia'];
const STATUS = ['disponivel','emprestado','reservado','danificado'];

export function gerarBiblioteca(count = 200, seed = 12345) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `BIB${(i + 1).toString().padStart(4, '0')}`,
    titulo: `Livro ${pick(['Cristianismo','Fé e Razão','Graça','Propósito','Liderança','Oração','Adoração'], rng)} - Vol. ${i + 1}`,
    autor: `Autor ${pick(['Silva','Santos','Oliveira','Souza','Lima','Pereira','Costa'], rng)}`,
    categoria: pick(CATEGORIAS, rng),
    ano: int(1980, 2024, rng),
    status: pick(STATUS, rng),
    emprestimosAno: int(0, 30, rng),
  }));
}
