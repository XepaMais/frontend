import { Navigate, Route } from 'react-router-dom';

import HomeUsuario from '@/modulos/usuario/paginas/inicio/Home';
import Mapa from '@/modulos/usuario/paginas/mapa/componentes/MapaU';
import DetalheProduto from '@/modulos/usuario/paginas/detalhe-produto/DetalheProduto';

import { Impacto } from '@/modulos/usuario/paginas/impacto/ImpactoU';
import Cozinha from '@/modulos/usuario/paginas/cozinha/componentes/Cozy';
import Pagamento from '@/modulos/usuario/paginas/pagamento/pagamento/pagamento';
import { Carrinho } from '@/modulos/usuario/paginas/carrinho/componentes/carrinho';
import Perfil from '@/modulos/usuario/paginas/perfil/Perfil';
import HistoricoPedidos from '@/modulos/usuario/paginas/historico-pedidos/HistoricoPedidos';
import Dispositivos from '@/modulos/usuario/paginas/dispositivos/Dispositivos';

export const rotasUsuario = [
  <Route key="demo-usuario" path="/demo/consumidor" element={<HomeUsuario />} />,
  <Route key="inicio-usuario" path="/consumidor" element={<HomeUsuario />} />,

  <Route key="mapa-usuario" path="/mapa" element={<Mapa />} />,
  <Route key="mapa-home" path="/mapa-home" element={<Mapa />} />,

  <Route key="receitas-usuario" path="/cozinha" element={<Cozinha />} />,
  <Route key="receitas-home" path="/cozinha-home" element={<Cozinha />} />,

  <Route key="detalhe-produto" path="/xepa" element={<DetalheProduto />} />,

  // Endereços da tela antiga de chat: levam para as conversas de verdade.
  <Route
    key="chat-consumidor"
    path="/chat-consumidor"
    element={<Navigate to="/consumidor/conversas" replace />}
  />,
  <Route key="chat-feirante" path="/chat-feirante" element={<Navigate to="/feirante/conversas" replace />} />,

  <Route key="impacto" path="/impacto" element={<Impacto />} />,
  <Route key="pagamento" path="/pagamento" element={<Pagamento />} />,
  <Route key="carrinho" path="/carrinho" element={<Carrinho />} />,

  <Route key="perfil" path="/perfil" element={<Perfil />} />,
  <Route key="historico-pedidos" path="/historico-pedidos" element={<HistoricoPedidos />} />,
  <Route key="dispositivos" path="/dispositivos" element={<Dispositivos />} />,
];
