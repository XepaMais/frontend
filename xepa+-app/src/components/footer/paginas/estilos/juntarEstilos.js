import Base from './PaginaFooter.module.css';

// Junta o visual comum das páginas do rodapé (PaginaFooter.module.css)
// com o CSS exclusivo de cada página.
export default function juntarEstilos(estilosDaPagina = {}) {
  return { ...Base, ...estilosDaPagina };
}
