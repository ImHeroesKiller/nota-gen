import * as React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PERADA Tools recovered from a render error:', error, errorInfo);
  }

  private retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <main className="erp-fatal-error" role="alert" aria-live="assertive">
        <section className="erp-fatal-error-card">
          <span className="erp-fatal-error-mark" aria-hidden="true">!</span>
          <div className="erp-fatal-error-copy">
            <span className="erp-eyebrow">Application Recovery</span>
            <h1>Tool tidak dapat dimuat</h1>
            <p>
              PERADA Tools menghentikan komponen yang bermasalah agar workspace lain tetap aman.
              Silakan coba lagi atau muat ulang aplikasi.
            </p>
            {this.state.error?.name && (
              <small>Kode error: {this.state.error.name}</small>
            )}
          </div>
          <div className="erp-fatal-error-actions">
            <button type="button" className="erp-error-secondary" onClick={this.retry}>
              Coba lagi
            </button>
            <button type="button" className="erp-error-primary" onClick={() => window.location.reload()}>
              Muat ulang aplikasi
            </button>
          </div>
        </section>
      </main>
    );
  }
}
