import { BrowserRouter, Routes, useLocation } from 'react-router-dom';

import { rotasPublicas } from './aplicacao/rotas/rotas-publicas';
import { rotasAutenticacao } from './aplicacao/rotas/rotas-autenticacao';
import { rotasFeirante } from './aplicacao/rotas/rotas-feirante';
import { rotasUsuario } from './aplicacao/rotas/rotas-usuario';
import { rotasAdmin } from './aplicacao/rotas/rotas-admin';

import Footer from './components/footer/footer';
import UserWay from './components/UserWay';
import RolarParaTopo from './compartilhado/componentes/RolarParaTopo';

import HeaderHomeGlobal from './modulos/publico/componentes/navegacao/HeaderHomeGlobal';
import NavbarFeiranteGlobal from './modulos/feirante/componentes/navegacao/NavbarFeiranteGlobal';
import NavbarUsuarioGlobal from './modulos/usuario/componentes/navegacao/NavbarUsuarioGlobal';

function Layout() {
  const { pathname } = useLocation();

  // O painel admin ocupa a tela toda, sem cabeçalhos e rodapé do site.
  if (pathname.toLowerCase().startsWith('/admin')) {
    return <Routes>{rotasAdmin}</Routes>;
  }

  return (
    <div className="app">
      <UserWay />

      <HeaderHomeGlobal />
      <NavbarFeiranteGlobal />
      <NavbarUsuarioGlobal />
      <Routes>
        {rotasAutenticacao}
        {rotasFeirante}
        {rotasUsuario}
        {rotasPublicas}
      </Routes>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <RolarParaTopo />
      <Layout />
    </BrowserRouter>
  );
}

export default App;
