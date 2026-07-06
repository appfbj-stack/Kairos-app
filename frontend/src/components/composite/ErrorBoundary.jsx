// frontend/src/components/composite/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    if (typeof console !== 'undefined') console.error('[ErrorBoundary]', error, info);
  }
  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10 rounded-card border border-danger/30 bg-danger/5 m-4">
          <AlertTriangle className="h-10 w-10 text-danger mb-3" />
          <p className="text-base font-semibold text-foreground">Algo deu errado</p>
          <p className="text-sm text-muted max-w-md mt-1">
            {String(this.state.error?.message || 'Erro inesperado')}
          </p>
          <Button className="mt-4" onClick={this.handleReload}>
            <RefreshCw className="h-4 w-4" /> Recarregar
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
