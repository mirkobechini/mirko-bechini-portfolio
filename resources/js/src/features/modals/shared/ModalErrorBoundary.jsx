import { Component } from 'react';

export default class ModalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Modal load error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <p>Errore nel caricamento del contenuto.</p>
          <button
            onClick={this.handleRetry}
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: '0.625rem',
              padding: '0.75rem 1.5rem',
              background: '#e76e05',
              color: '#fff',
              border: '3px solid #000',
              cursor: 'pointer',
              textTransform: 'uppercase',
              boxShadow: '0 3px 0 #8a4303',
            }}
            aria-label="Riprova a caricare il contenuto"
          >
            RIPROVA
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}