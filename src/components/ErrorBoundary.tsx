import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null
    };

    constructor(props: ErrorBoundaryProps) {
        super(props);
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-red-100 dark:bg-red-950/30 text-red-500 mb-6">
                            <span className="material-symbols-outlined text-4xl">error</span>
                        </div>
                        <h1 className="text-2xl font-display font-extrabold text-neutral-text dark:text-white mb-2">Something went wrong</h1>
                        <p className="text-slate-500 text-sm mb-6">
                            {this.state.error?.message || 'An unexpected error occurred.'}
                        </p>
                        <button
                            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                            className="px-6 py-3 bg-primary-default text-white font-bold rounded-xl shadow-lg shadow-primary-default/20 hover:brightness-110 transition-all active:scale-95"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}
