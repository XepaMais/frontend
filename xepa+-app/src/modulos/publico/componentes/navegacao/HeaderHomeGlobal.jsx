import { useLocation } from 'react-router-dom';
import Header from '@/modulos/publico/paginas/inicio/componentes/Header';

function HeaderHomeGlobal() {
  const { pathname } = useLocation();

  const caminhosHome = ['/mapa-home', '/cozinha-home'];

  // Páginas de uma receita (/cozinha-home/bolo-banana) também mostram o cabeçalho do site.
  if (!caminhosHome.includes(pathname) && !pathname.startsWith('/cozinha-home/')) {
    return null;
  }

  return <Header />;
}

export default HeaderHomeGlobal;
