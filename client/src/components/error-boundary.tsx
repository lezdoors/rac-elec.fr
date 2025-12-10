import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Mail } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9)
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
      errorId: Math.random().toString(36).substr(2, 9)
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.error('Failed to log error:', err));
    } catch (loggingError) {
      console.error('Error logging failed:', loggingError);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const subject = encodeURIComponent(`Erreur signalée - ID: ${this.state.errorId}`);
    const body = encodeURIComponent(`
Bonjour,

Une erreur s'est produite sur le site demande-raccordement.fr.

ID de l'erreur: ${this.state.errorId}
URL: ${window.location.href}
Message: ${this.state.error?.message || 'Erreur inconnue'}

Merci de votre attention.
    `);
    
    window.location.href = `mailto:support@demande-raccordement.fr?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Une erreur inattendue s'est produite
                </h2>
                
                <p className="text-gray-600 mb-6 text-sm">
                  Nous nous excusons pour ce désagrément. Notre équipe technique a été automatiquement notifiée.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mb-6 w-full">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      Détails de l'erreur (développement)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-left overflow-auto">
                      <div className="text-red-600 font-semibold mb-2">
                        {this.state.error.message}
                      </div>
                      <pre className="whitespace-pre-wrap text-gray-700">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={this.handleRetry}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Réessayer
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Accueil
                  </button>
                </div>

                <button
                  onClick={this.handleReportError}
                  className="mt-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Signaler cette erreur
                </button>

                {this.state.errorId && (
                  <p className="mt-4 text-xs text-gray-400">
                    ID de référence: {this.state.errorId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook pour gérer les erreurs asynchrones
export const useAsyncError = () => {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

// Composant d'erreur léger pour les cas simples
export const SimpleErrorFallback = ({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) => (
  <div className="rounded-lg bg-red-50 p-4 border border-red-200">
    <div className="flex items-start">
      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
      <div className="ml-3 flex-1">
        <h3 className="text-sm font-medium text-red-800">
          Erreur de chargement
        </h3>
        <p className="mt-1 text-sm text-red-700">
          {error.message || 'Une erreur inattendue s\'est produite'}
        </p>
        <button
          onClick={resetError}
          className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
        >
          Réessayer
        </button>
      </div>
    </div>
  </div>
);

// HOC pour wrapper les composants avec gestion d'erreur
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};