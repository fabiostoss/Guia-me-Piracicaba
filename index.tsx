import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * Funçao de inicialização robusta para evitar a "página branca".
 * Captura erros de carregamento de módulos e os exibe na tela.
 */
async function bootstrap() {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;

  try {
    console.log("Bootstrap: Importando App e componentes...");
    const [AppModule, ErrorBoundaryModule] = await Promise.all([
      import('./App'),
      import('./components/ErrorBoundary')
    ]);

    const App = AppModule.default;
    const ErrorBoundary = ErrorBoundaryModule.default;

    console.log("Bootstrap: Montando aplicação...");
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log("Bootstrap: Aplicação montada com sucesso.");
  } catch (err: any) {
    console.error("BOOTSTRAP ERROR:", err);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6;">
        <h1 style="color: #e11d48;">Falha Crítica na Inicialização</h1>
        <p>A aplicação não pôde ser iniciada devido a um erro de carregamento:</p>
        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; border: 1px solid #cbd5e1; overflow-x: auto;">
          <code style="color: #1e293b; font-weight: bold;">${err.message || err}</code>
        </div>
        <p style="margin-top: 20px; color: #64748b; font-size: 14px;">
          Dica: Verifique o console do navegador (F12) para mais detalhes ou reinicie o servidor de desenvolvimento.
        </p>
        <button onclick="window.location.reload()" style="background: #008b91; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-top: 10px;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

bootstrap();
