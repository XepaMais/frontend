import Base from './PaginaFooter.module.css';

// Junta o CSS comum das páginas do rodapé com o de cada página.
export default function juntarEstilos(estilosDaPagina = {}) {
  return { ...Base, ...estilosDaPagina };
}
