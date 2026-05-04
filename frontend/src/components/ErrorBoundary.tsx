import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
          <div className="max-w-lg w-full text-center">
            <div className="w-24 h-24 mx-auto mb-8 bg-red-50 rounded-3xl flex items-center justify-center border-2 border-red-100 shadow-xl shadow-red-100/30">
              <AlertTriangle size={40} className="text-red-500" />
            </div>

            <h1 className="text-4xl font-black text-primary mb-3 tracking-tight">
              Oops! Something Went Wrong
            </h1>
            <p className="text-muted text-base mb-2 font-medium">
              We encountered an unexpected error. Don't worry, it's not your fault!
            </p>

            {this.state.error && (
              <div className="mt-4 mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Error Details</p>
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-accent text-white rounded-2xl font-bold text-sm hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
              >
                <RefreshCw size={18} /> Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-gray-200 text-primary rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
              >
                <Home size={18} /> Go Home
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-10 font-medium">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
