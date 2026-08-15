import { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

interface RuntimeFaultState {
  error: Error | null;
  componentStack: string | null;
}

class RuntimeFaultBoundary extends Component<{ children: ReactNode }, RuntimeFaultState> {
  state: RuntimeFaultState = { error: null, componentStack: null };

  componentDidMount(): void {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount(): void {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  static getDerivedStateFromError(error: Error): Partial<RuntimeFaultState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('JURE runtime fault', error, info);
    this.setState({ componentStack: info.componentStack ?? null });
  }

  private handleWindowError = (event: ErrorEvent): void => {
    const error = event.error instanceof Error
      ? event.error
      : new Error(event.message || 'Unknown browser runtime error.');
    console.error('JURE window runtime fault', error);
    this.setState({ error });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(typeof event.reason === 'string' ? event.reason : 'Unhandled browser promise rejection.');
    console.error('JURE unhandled rejection', error);
    this.setState({ error });
  };

  render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <main style={{ minHeight: '100vh', padding: '24px', background: '#0b1014', color: '#e7eef5', fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace' }}>
        <h1 style={{ marginTop: 0, fontSize: '18px', color: '#ff8b8b' }}>JURE runtime fault — workbench stopped safely</h1>
        <p>The browser caught an error instead of leaving a blank screen. Copy or screenshot this panel for the orchestrator.</p>
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: '16px', border: '1px solid #663b3b', background: '#151012' }}>
          {this.state.error.name}: {this.state.error.message}{'\n'}
          {this.state.error.stack ?? '(no browser stack available)'}
          {this.state.componentStack ? `\n\nReact component stack:${this.state.componentStack}` : ''}
        </pre>
        <button type="button" onClick={() => window.location.reload()} style={{ padding: '8px 14px' }}>Reload workbench</button>
      </main>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RuntimeFaultBoundary>
      <App />
    </RuntimeFaultBoundary>
  </StrictMode>,
);
