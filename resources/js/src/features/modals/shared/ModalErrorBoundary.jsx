import { Component } from 'react';

export default class ModalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Modal load error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <p>Errore nel caricamento del contenuto. Riprova.</p>;
    }

    return this.props.children;
  }
}