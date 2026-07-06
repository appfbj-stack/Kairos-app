// frontend/src/mocks/hooks/useMockData.js
import { useMemo } from 'react';
import { useMockStore } from '../stores/mockStore';

export function useMockData(tipo, options = {}) {
  const { dados, carregar } = useMockStore();
  if (!dados) carregar();

  const { filter: optFilter, limit: optLimit } = options;

  return useMemo(() => {
    if (!dados || !dados[tipo]) return [];
    let result = dados[tipo];
    if (optFilter) {
      result = result.filter((item) => {
        return Object.entries(optFilter).every(([k, v]) => item[k] === v);
      });
    }
    if (optLimit && Number.isFinite(optLimit)) {
      result = result.slice(0, optLimit);
    }
    return result;
  }, [dados, tipo, optFilter, optLimit]);
}

export default useMockData;
