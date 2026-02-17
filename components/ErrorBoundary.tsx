
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full text-center border border-slate-100">
                        <div className="bg-red-50 text-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 mb-2">Ops, algo deu errado!</h1>
                        <p className="text-slate-500 mb-6 font-medium">Não foi possível carregar esta parte da aplicação. Tente recarregar a página.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-brand-teal text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-teal-dark transition-all shadow-lg shadow-brand-teal/20"
                        >
                            Recarregar Página
                        </button>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-48">
                                <p className="text-red-500 font-mono text-xs">{this.state.error.toString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
