import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cada página tem um título próprio na aba do navegador (WCAG 2.4.2: leitores de tela anunciam o título).
const TITULOS = {
  '/': 'Menos desperdício, mais alimento',
  '/sobre-nos': 'Sobre nós',
  '/xep-ai': 'Xep.AI',
  '/suporte': 'Suporte',
  '/seja-parceiro': 'Seja um feirante parceiro',
  '/termos-de-uso': 'Termos de uso',
  '/privacidade': 'Diretrizes de privacidade',
  '/mapa-home': 'Mapa de feiras',
  '/cozinha-home': 'Receitas',
  '/entrar': 'Entrar',
  '/cadastro': 'Criar conta',
  '/cadastro/consumidor': 'Criar conta de consumidor',
  '/cadastro/feirante': 'Criar conta de feirante',
  '/cadastro/feirante/negocio': 'Dados da banca',
  '/demo': 'Demonstração',
  '/demo/consumidor': 'Demonstração: consumidor',
  '/demo/feirante': 'Demonstração: feirante',
  '/consumidor': 'Início',
  '/consumidor/conversas': 'Conversas',
  '/mapa': 'Mapa de feiras',
  '/cozinha': 'Receitas',
  '/xepa': 'Detalhes da xepa',
  '/carrinho': 'Carrinho',
  '/pagamento': 'Pagamento',
  '/historico-pedidos': 'Meus pedidos',
  '/impacto': 'Meu impacto',
  '/perfil': 'Meus dados',
  '/dispositivos': 'Dispositivos conectados',
  '/feirante': 'Início do feirante',
  '/feirante/conversas': 'Conversas com clientes',
  '/adicionar-produto': 'Publicar xepa',
  '/adicionar-feira': 'Minhas feiras',
  '/financeiro': 'Financeiro',
  '/adicionar-gasto': 'Gastos',
  '/sacar': 'Sacar',
  '/planilhas': 'Planilhas',
  '/planos': 'Planos',
  '/chat-ia': 'Xepinha',
  '/historico-vendas': 'Histórico de vendas',
  '/historico-produtos': 'Meus produtos',
  '/perfil-feirante': 'Meus dados',
  '/dispositivos-feirante': 'Dispositivos conectados',
  '/mapa-feirante': 'Mapa de feiras',
  '/admin': 'Administração',
};

function TituloDaPagina() {
  const { pathname } = useLocation();

  useEffect(() => {
    const caminho = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const titulo = TITULOS[caminho] ?? TITULOS[caminho.toLowerCase()] ?? 'Página não encontrada';
    document.title = `${titulo} | Xepa+`;
  }, [pathname]);

  return null;
}

export default TituloDaPagina;
