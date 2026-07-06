import { mulberry32, int, pick, dateBetween } from '../../lib/seed';

const MARCAS = ['Fiat','Volkswagen','Chevrolet','Ford','Toyota','Honda','Renault'];
const STATUS = ['ativo','manutenção','inativo'];

export function gerarVeiculos(count = 30, seed = 12345) {
  const rng = mulberry32(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: `V${(i + 1).toString().padStart(3, '0')}`,
    modelo: `${pick(MARCAS, rng)} ${pick(['Uno','Gol','Onix','Ka','Corolla','Civic','Kwid','Strada'], rng)}`,
    placa: `ABC${String(i + 1).padStart(3, '0')}`,
    ano: int(2010, 2024, rng),
    km: int(10000, 150000, rng),
    status: pick(STATUS, rng),
    ultimaRevisao: dateBetween(2, 0, rng).toISOString().slice(0, 10),
    lotadoEm: pick(['Sede','Filial A','Filial B'], rng),
  }));
}
