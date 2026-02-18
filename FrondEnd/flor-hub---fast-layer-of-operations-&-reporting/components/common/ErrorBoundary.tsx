import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error Message */}
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          ¡Algo salió mal!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          La aplicación encontró un error inesperado. Por favor, intenta recargar la página.
        </p>

        {/* Error Details (dev mode only) */}
        {import.meta.env.DEV && error && (
          <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg text-left">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
          >
            Reintentar
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
          >
            Recargar Página
          </button>
        </div>
      </div>
    </div>
  );
}

function errorHandler(error: Error, info: { componentStack: string }) {
  console.error('ErrorBoundary caught an error:', error, info);
  // TODO: Send to error tracking service (e.g., Sentry)
  // logErrorToService(error, info);
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={errorHandler}
      onReset={() => {
        // Optional: Clear any error state here
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

