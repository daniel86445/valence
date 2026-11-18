import { Component, type ReactNode } from 'react';

/** Shows what went wrong instead of a black screen. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 40, color: '#EAF2FF', fontFamily: 'monospace', maxWidth: 800 }}>
        <h1 style={{ color: '#FFB020' }}>Valence hit an error</h1>
        <p>Send this message to Claude:</p>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#0B1526', padding: 16 }}>{String(this.state.error.stack ?? this.state.error)}</pre>
        <button onClick={() => { localStorage.removeItem('valence-save-v1'); location.reload(); }} style={{ marginTop: 16, padding: 12 }}>
          Reset save and reload
        </button>
      </div>
    );
  }
}
