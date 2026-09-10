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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-8">
          <div className="max-w-2xl bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ Terjadi Error
            </h1>
            <p className="text-gray-700 mb-4">
              Maaf, terjadi kesalahan saat memuat komponen ini.
            </p>
            <details className="mb-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                Detail Error (untuk debugging)
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                <p className="font-bold text-red-600 mb-2">
                  {this.state.error?.name}: {this.state.error?.message}
                </p>
                <pre className="whitespace-pre-wrap">
                  {this.state.error?.stack}
                </pre>
              </div>
            </details>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Reload Halaman
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
