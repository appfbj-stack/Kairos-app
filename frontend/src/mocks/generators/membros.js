// frontend/src/mocks/generators/membros.js
import { mulberry32, nomeBR, cpfBR, telefoneBR, dateBetween, chance, pick } from '../../lib/seed';

const STATUS = ['ativo', 'ativo', 'ativo', 'ativo', 'inativo', 'novo'];
const CARGOS = ['Membro','Membro','Membro','Diácono','Presbítero','Líder de Célula','Líder de Louvor','Cooperador','Obreiro'];
const ESTADOS_CIVIS = ['Solteiro(a)','Casado(a)','Casado(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'];

export function gerarMembros(count = 2000, seed = 12345, congregacoesIds = []) {
  const rng = mulberry32(seed);
  const congsIds = congregacoesIds.length ? congregacoesIds : Array.from({ length: 35 }, (_, i) => `C${(i + 1).toString().padStart(3, '0')}`);
  const list = [];
  for (let i = 0; i < count; i++) {
    const sexo = chance(0.5, rng) ? 'M' : 'F';
    const dataNasc = dateBetween(85, 0, rng);
    const status = pick(STATUS, rng);
    const batizado = chance(0.75, rng);
    list.push({
      id: `M${(i + 1).toString().padStart(5, '0')}`,
      nome: nomeBR(rng),
      cpf: cpfBR(rng),
      telefone: telefoneBR(rng),
      email: `membro${i + 1}@email.com`,
      sexo,
      dataNasc: dataNasc.toISOString().slice(0, 10),
      estadoCivil: pick(ESTADOS_CIVIS, rng),
      cidade: pick(['São Paulo','Rio de Janeiro','Belo Horizonte','Curitiba','Salvador','Sorocaba','Campinas','Niterói'], rng),
      bairro: pick(['Centro','Jardim Primavera','Vila Mariana','Pinheiros','Copacabana','Botafogo','Savassi','Centro','Batel','Barra'], rng),
      uf: pick(['SP','RJ','MG','PR','BA'], rng),
      congregacaoId: pick(congsIds, rng),
      cargo: pick(CARGOS, rng),
      status,
      batizado,
      dataBatismo: batizado ? dateBetween(30, 0, rng).toISOString().slice(0, 10) : null,
      ativoDesde: dateBetween(40, 0, rng).toISOString().slice(0, 10),
    });
  }
  return list;
}

export default gerarMembros;
