import { mulberry32, int, pick } from '../../lib/seed';

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const BAIRROS = ['Centro','Jardim América','Vila Nova','Santa Tereza','Bela Vista','São João','Parque Verde'];

export function gerarCelulas(count = 80, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  return Array.from({ length: count }, (_, i) => ({
    id: `CL${(i + 1).toString().padStart(3, '0')}`,
    nome: `Célula ${pick(['Fé','Esperança','Amor','Vida','Paz','Graça','União','Renovo','Avivamento','Restauração'], rng)} ${i + 1}`,
    lider: `Membro Líder ${i + 1}`,
    bairro: pick(BAIRROS, rng),
    diaReuniao: pick(DIAS, rng),
    participantes: int(8, 40, rng),
    congregacaoId: pick(congsIds, rng),
    ativa: i % 5 !== 0,
  }));
}
