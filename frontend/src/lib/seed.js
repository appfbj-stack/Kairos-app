// frontend/src/lib/seed.js

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const pick = (arr, rng = Math.random) => arr[Math.floor(rng() * arr.length)];
export const int = (min, max, rng = Math.random) => Math.floor(rng() * (max - min + 1)) + min;
export const chance = (p, rng = Math.random) => rng() < p;

export function dateBetween(yearsAtras, yearsFrente, rng = Math.random) {
  const now = Date.now();
  const offsetMs = (rng() * (yearsAtras + yearsFrente) - yearsAtras) * 365 * 24 * 3600 * 1000;
  return new Date(now + offsetMs);
}

const NOMES_M = ['João','José','Pedro','Paulo','Lucas','Mateus','Marcos','André','Felipe','Rafael','Tiago','Bruno','Carlos','Eduardo','Gabriel','Henrique','Igor','Leonardo','Marcelo','Ricardo','Rodrigo','Sérgio','Thiago','Vinícius','Wesley','Daniel','Fernando','Gustavo'];
const NOMES_F = ['Maria','Ana','Beatriz','Camila','Daniela','Eduarda','Fernanda','Gabriela','Helena','Isabela','Juliana','Larissa','Mariana','Natália','Patrícia','Queila','Rafaela','Sandra','Tamires','Vanessa','Adriana','Bianca','Carla','Daniela','Eliane','Flávia','Gisele','Lívia'];
const SOBRENOMES = ['Silva','Santos','Oliveira','Souza','Costa','Pereira','Ferreira','Almeida','Lima','Ribeiro','Carvalho','Rocha','Alves','Cardoso','Mendes','Barbosa','Freitas','Antunes','Pires','Moraes','Correia','Nunes','Teixeira','Moreira','Nascimento','Araújo','Bernardes','Farias'];

export function nomeBR(rng = Math.random) {
  const primeiro = chance(0.5, rng) ? pick(NOMES_M, rng) : pick(NOMES_F, rng);
  const meio = chance(0.6, rng) ? ' ' + pick([...NOMES_M, ...NOMES_F], rng) : '';
  const sobrenome = `${pick(SOBRENOMES, rng)} ${pick(SOBRENOMES, rng)}`;
  return `${primeiro}${meio} ${sobrenome}`.trim();
}

const CIDADES = [
  ['São Paulo','SP'],['Rio de Janeiro','RJ'],['Belo Horizonte','MG'],['Curitiba','PR'],['Salvador','BA'],
  ['Campinas','SP'],['Guarulhos','SP'],['Sorocaba','SP'],['Osasco','SP'],['São Bernardo do Campo','SP'],
  ['Niterói','RJ'],['Belford Roxo','RJ'],['Contagem','MG'],['Betim','MG'],['Londrina','PR'],
  ['Maringá','PR'],['Feira de Santana','BA'],['Vitória da Conquista','BA'],['Santos','SP'],['Ribeirão Preto','SP'],
  ['Piracicaba','SP'],['Mauá','SP'],['São José dos Campos','SP'],['São João de Meriti','RJ'],['Camaçari','BA'],
];
export const cidadeBR = (rng = Math.random) => pick(CIDADES, rng);

const UFS = ['SP','RJ','MG','PR','BA'];
export const ufBR = (rng = Math.random) => pick(UFS, rng);

export function cpfBR(rng = Math.random) {
  const d = Array.from({ length: 11 }, () => int(0, 9, rng)).join('');
  return d;
}

export function telefoneBR(rng = Math.random) {
  return `${int(11, 99, rng)}9${int(1000, 9999, rng)}${int(1000, 9999, rng)}`;
}