// frontend/src/app/providers/QueryProvider.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const qc = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function QueryProvider({ children }) {
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export { qc };
