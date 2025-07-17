import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ImportantSubjects Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="text-center py-16 px-8 bg-red-50 rounded-2xl border border-red-200">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-medium text-red-600 mb-4">
            Bir hata oluştu
          </h2>
          <p className="text-red-500 text-base mb-4">
            Konu analizi yüklenirken bir sorun yaşandı.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 