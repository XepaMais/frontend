import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/compartilhado/estilos/globais.css';
import '@/compartilhado/estilos/aplicacao.css';
import App from '@/App.jsx';
import { limparDemoAntiga } from '@/compartilhado/servicos/autenticacao';

limparDemoAntiga();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
