import { Route } from 'react-router-dom';
import RedirecionarRota from '@/compartilhado/componentes/RedirecionarRota';

// URLs antigas do site, trocadas por endereços em português e fáceis de entender.
// Ficam aqui só para redirecionar quem tiver um link antigo salvo.
const ENDERECOS_ANTIGOS = {
  '/Crumb': '/entrar',
  '/OpcaoLogin': '/cadastro',
  '/CriarConta': '/cadastro/consumidor',
  '/CriarUsuarioF': '/cadastro/feirante',
  '/CriarContaF': '/cadastro/feirante/negocio',
  '/homeU': '/consumidor',
  '/homeF': '/feirante',
  '/Verduras': '/xepa',
  '/HistoricoChat': '/feirante/conversas',
  '/HistoricoChatUsuario': '/consumidor/conversas',
  '/sobrenos': '/sobre-nos',
};

export const rotasAntigas = Object.entries(ENDERECOS_ANTIGOS).map(([antigo, novo]) => (
  <Route key={`antigo-${antigo}`} path={antigo} caseSensitive element={<RedirecionarRota para={novo} />} />
));
