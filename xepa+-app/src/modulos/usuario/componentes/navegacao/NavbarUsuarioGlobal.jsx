import { useLocation } from 'react-router-dom';
import NavbarC from './NavbarC';

function NavbarUsuarioGlobal() {
  const { pathname } = useLocation();

  const caminhosUsuario = [
    '/consumidor',
    '/demo/consumidor',
    '/mapa',
    '/cozinha',
    '/impacto',
    '/carrinho',
    '/perfil',
    '/xepa',
    '/consumidor/conversas',
    '/pagamento',
    '/historico-pedidos',
    '/dispositivos',
  ];

  // Páginas de uma receita (/cozinha/bolo-banana) também mostram o menu do consumidor.
  if (!caminhosUsuario.includes(pathname) && !pathname.startsWith('/cozinha/')) {
    return null;
  }

  return <NavbarC />;
}

export default NavbarUsuarioGlobal;
