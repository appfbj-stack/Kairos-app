// frontend/src/mocks/stores/mockStore.js
import { create } from 'zustand';
import { gerarTudo } from '../generators/index';

let _dados = null;
function carregar() {
  if (!_dados) _dados = gerarTudo(12345);
  return _dados;
}

export const useMockStore = create((set, get) => ({
  dados: null,
  carregado: false,
  carregar: () => {
    if (get().carregado) return;
    set({ dados: carregar(), carregado: true });
  },
}));
