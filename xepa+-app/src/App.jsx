import { useEffect } from 'react';
import { BrowserRouter, Routes, useLocation, useNavigate } from 'react-router-dom';
import { EVENTO_SESSAO_EXPIRADA } from './compartilhado/servicos/api';

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
  const navegar = useNavigate();

  // Login vencido (ou de antes do token): leva para a tela de entrar.
  useEffect(() => {
    const irParaLogin = () => navegar('/Crumb', { replace: true });
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, irParaLogin);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, irParaLogin);
  }, [navegar]);

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
