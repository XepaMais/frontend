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

  if (!caminhosUsuario.includes(pathname)) {
    return null;
  }

  return <NavbarC />;
}

export default NavbarUsuarioGlobal;
