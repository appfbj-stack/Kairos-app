import { mulberry32, int, pick, dateBetween } from '../../lib/seed';

const TIPOS = ['aviso','comunicado','convite','agenda','urgente'];
const AUTORES = ['Secretaria','Pastoral','Comunicação','Administração','Eventos'];
const STATUS = ['publicado','rascunho','agendado'];

export function gerarComunicacao(count = 100, seed = 12345) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => {
    const data = dateBetween(1, 0, rng);
    return {
      id: `COM${(i + 1).toString().padStart(4, '0')}`,
      titulo: `Comunicado: ${pick(['Reunião','Evento','Convocação','Aviso','Informativo'], rng)} #${i + 1}`,
      tipo: pick(TIPOS, rng),
      autor: pick(AUTORES, rng),
      data: data.toISOString().slice(0, 10),
      status: pick(STATUS, rng),
      visualizacoes: int(50, 2000, rng),
      conteudo: `Conteúdo do comunicado ${i + 1}. Lorem ipsum dolor sit amet.`,
    };
  });
}
