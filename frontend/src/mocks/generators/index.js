// frontend/src/mocks/generators/index.js
import { gerarCongregacoes } from './congregacoes';
import { gerarMembros } from './membros';
import { gerarPastores } from './pastores';
import { gerarObreiros } from './obreiros';
import { gerarDepartamentos } from './departamentos';
import { gerarEventos } from './eventos';
import { gerarCultos } from './cultos';
import { gerarEscalas } from './escalas';
import { gerarAniversariantes } from './aniversariantes';
import { gerarDocumentos } from './documentos';
import { gerarFinanceiro } from './financeiro';
import { gerarCelulas } from './celulas';
import { gerarPatrimonio } from './patrimonio';
import { gerarVeiculos } from './veiculos';
import { gerarProjetos } from './projetos';
import { gerarBiblioteca } from './biblioteca';
import { gerarComunicacao } from './comunicacao';

export function gerarTudo(seed = 12345) {
  const congregacoes = gerarCongregacoes(35, seed);
  const congregacoesIds = congregacoes.map((c) => c.id);
  const pastores = gerarPastores(80, seed + 1, congregacoesIds);
  const obreiros = gerarObreiros(250, seed + 2, congregacoesIds);
  const departamentos = gerarDepartamentos(50, seed + 3, congregacoesIds);
  const membros = gerarMembros(2000, seed + 4, congregacoesIds);
  const eventos = gerarEventos(500, seed + 5, congregacoesIds);
  const cultos = gerarCultos(1000, seed + 6, congregacoesIds, pastores);
  const escalas = gerarEscalas(200, seed + 7, congregacoesIds);
  const documentos = gerarDocumentos(300, seed + 8, congregacoesIds);
  const financeiro = gerarFinanceiro(500, seed + 9, congregacoesIds);
  const celulas = gerarCelulas(80, seed + 10, congregacoesIds);
  const patrimonio = gerarPatrimonio(150, seed + 11);
  const veiculos = gerarVeiculos(30, seed + 12);
  const projetos = gerarProjetos(60, seed + 13);
  const biblioteca = gerarBiblioteca(200, seed + 14);
  const comunicacao = gerarComunicacao(100, seed + 15);
  const aniversariantes = gerarAniversariantes(membros, pastores, obreiros);
  return { congregacoes, membros, pastores, obreiros, departamentos, eventos, cultos, escalas, documentos, financeiro, celulas, patrimonio, veiculos, projetos, biblioteca, comunicacao, aniversariantes };
}

export const REGISTRY = {
  membros: gerarMembros,
  congregacoes: gerarCongregacoes,
  pastores: gerarPastores,
  obreiros: gerarObreiros,
  departamentos: gerarDepartamentos,
  eventos: gerarEventos,
  cultos: gerarCultos,
  escalas: gerarEscalas,
  documentos: gerarDocumentos,
  financeiro: gerarFinanceiro,
  celulas: gerarCelulas,
  patrimonio: gerarPatrimonio,
  veiculos: gerarVeiculos,
  projetos: gerarProjetos,
  biblioteca: gerarBiblioteca,
  comunicacao: gerarComunicacao,
  aniversariantes: gerarAniversariantes,
};
