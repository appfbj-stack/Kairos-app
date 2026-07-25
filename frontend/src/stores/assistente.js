import { create } from 'zustand';

export const useAssistenteStore = create((set) => ({
  aberto: false,
  historico: [],
  carregando: false,
  acaoPendente: null,
  dadosColetados: {},
  contextoAtual: null,
  dadosContexto: null,

  abrir: () => set({ aberto: true }),
  fechar: () => set({ aberto: false }),
  alternar: () => set((s) => ({ aberto: !s.aberto })),

  adicionarMensagem: (role, content) =>
    set((s) => ({
      historico: [...s.historico, { role, content }].slice(-40),
    })),

  setCarregando: (v) => set({ carregando: v }),
  setAcaoPendente: (acao) => set({ acaoPendente: acao }),
  limparAcaoPendente: () => set({ acaoPendente: null, dadosColetados: {} }),
  limparHistorico: () => set({ historico: [], acaoPendente: null, dadosColetados: {} }),

  setContexto: (tipo, dados) => set({
    contextoAtual: tipo,
    dadosContexto: dados,
  }),
  limparContexto: () => set({ contextoAtual: null, dadosContexto: null }),
}));
