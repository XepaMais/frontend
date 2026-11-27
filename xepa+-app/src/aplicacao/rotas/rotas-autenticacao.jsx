import { Route } from 'react-router-dom';
import Crumb from '@/modulos/autenticacao/paginas/Crumb';
import Demo from '@/modulos/autenticacao/paginas/demo/Demo';
import OpcaoLogin from '@/modulos/autenticacao/paginas/OpcaoLogin';
import CriarUsuarioF from '@/modulos/autenticacao/paginas/CriarUsuarioF';
import CriarContaF from '@/modulos/autenticacao/paginas/CriarContaF';
import CriarConta from '@/modulos/autenticacao/paginas/CriarConta';

export const rotasAutenticacao = [
  <Route key="crumb" path="/entrar" element={<Crumb />} />,
  <Route key="demo" path="/demo" element={<Demo />} />,
  <Route key="opcao-login" path="/cadastro" element={<OpcaoLogin />} />,
  <Route key="criar-conta-feirante" path="/cadastro/feirante/negocio" element={<CriarContaF />} />,
  <Route key="criar-usuario-feirante" path="/cadastro/feirante" element={<CriarUsuarioF />} />,
  <Route key="criar-conta" path="/cadastro/consumidor" element={<CriarConta />} />,
];
