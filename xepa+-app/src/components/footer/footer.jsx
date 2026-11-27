import { Link, useLocation, useNavigate } from 'react-router-dom';
import Styles from './footer.module.css';
import logo from '@/assets/imagens/gerais/logo-branca.png';
import { CAMINHOS_FEIRANTE } from '@/modulos/feirante/componentes/navegacao/caminhosFeirante';
import { carregarVendasDoFeirante, PENDENTE_RETIRADA } from '@/compartilhado/servicos/pedidos';

// Colunas do rodapé do site público.
const COLUNAS_PUBLICAS = [
  {
    titulo: 'Tecnologias e IA',
    links: [
      { texto: 'Xep.AI', destino: '/xep-ai' },
      { texto: 'Contato e suporte', destino: '/suporte' },
    ],
  },
  {
    titulo: 'Para vender',
    links: [
      { texto: 'Seja um feirante parceiro', destino: '/seja-parceiro' },
      { texto: 'Cadastrar minha barraca', destino: '/CriarUsuarioF' },
    ],
  },
  {
    titulo: 'Home page',
    links: [
      { texto: 'Home', destino: '/' },
      { texto: 'Quem somos', destino: '/#sobre' },
      { texto: 'Como funciona', destino: '/#como-funciona' },
      { texto: 'O que você vai receber', destino: '/#beneficios' },
      { texto: 'Divulgação', destino: '/#divulgacao' },
      { texto: 'Planos', destino: '/#planos-titulo' },
      { texto: 'Mapas das feiras', destino: '/#mapa' },
    ],
  },
];

// Colunas do rodapé da área do feirante.
const COLUNAS_FEIRANTE = [
  {
    titulo: 'Pedidos',
    links: [
      { texto: 'Pedidos para retirar', destino: '/historico-vendas', contador: 'pendentes' },
      { texto: 'Histórico de vendas', destino: '/historico-vendas' },
      { texto: 'Conversas com clientes', destino: '/HistoricoChat' },
    ],
  },
  {
    titulo: 'Minha banca',
    links: [
      { texto: 'Início', destino: '/homeF' },
      { texto: 'Cadastrar Xepa', destino: '/adicionar-produto' },
      { texto: 'Histórico de produtos', destino: '/historico-produtos' },
      { texto: 'Minhas feiras', destino: '/adicionar-feira' },
    ],
  },
  {
    titulo: 'Gestão',
    links: [
      { texto: 'Financeiro', destino: '/financeiro' },
      { texto: 'Despesas', destino: '/adicionar-gasto' },
      { texto: 'Planilhas', destino: '/planilhas' },
      { texto: 'Sacar', destino: '/sacar' },
      { texto: 'Xep.AI', destino: '/chat-ia' },
    ],
  },
  {
    titulo: 'Minha conta',
    links: [
      { texto: 'Meus dados', destino: '/perfil-feirante' },
      { texto: 'Planos', destino: '/planos' },
      { texto: 'Segurança', destino: '/dispositivos-feirante' },
      { texto: 'Contato e suporte', destino: '/suporte' },
    ],
  },
];

// Quem rola pode ser o <body> (overflow-x: hidden).
function rolarParaOTopo() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Espera a seção aparecer (a página pode estar trocando) e rola até ela.
function rolarParaSecao(id, tentativas = 30) {
  const secao = document.getElementById(id);

  if (secao) {
    // Rolagem direta: o modo smooth pode travar no <body>.
    secao.scrollIntoView({ block: 'start' });
    return;
  }

  if (tentativas > 0) {
    setTimeout(() => rolarParaSecao(id, tentativas - 1), 50);
  }
}

// O Link não rola a página: sem isso, a nova página abre no meio.
function LinkRodape({ to, children, ...props }) {
  const navigate = useNavigate();

  function aoClicar(evento) {
    // Ctrl/Cmd/Shift + clique continua abrindo em nova aba normalmente.
    if (evento.ctrlKey || evento.metaKey || evento.shiftKey || evento.button !== 0) {
      return;
    }

    evento.preventDefault();
    const secao = to.split('#')[1];

    navigate(to);

    if (secao) {
      rolarParaSecao(secao);
    } else {
      setTimeout(rolarParaOTopo, 0);
    }
  }

  return (
    <Link to={to} onClick={aoClicar} {...props}>
      {children}
    </Link>
  );
}

function Footer() {
  const { pathname } = useLocation();
  const areaFeirante = CAMINHOS_FEIRANTE.includes(pathname);
  const colunas = areaFeirante ? COLUNAS_FEIRANTE : COLUNAS_PUBLICAS;
  const pendentes = areaFeirante
    ? carregarVendasDoFeirante().filter((pedido) => pedido.status === PENDENTE_RETIRADA).length
    : 0;

  return (
    <footer className={Styles.footer}>
      <div className={Styles.rodapeTopo}>
        <div className={Styles.marca}>
          <LinkRodape
            className={Styles.logo}
            to={areaFeirante ? '/homeF' : '/'}
            aria-label="Xepa+, página inicial"
          >
            <img src={logo} alt="" />
            <span>Xepa+</span>
          </LinkRodape>

          <p className={Styles.descricao}>
            {areaFeirante
              ? 'Gerencie seus pedidos, suas Xepas e o financeiro da sua banca em um só lugar.'
              : 'Conectando feirantes e consumidores para combater o desperdício de alimentos. Alimentos frescos, sustentabilidade e economia para a sua rotina.'}
          </p>

          <div className={Styles.redes} aria-label="Redes sociais">
            <a
              href="https://www.linkedin.com/company/xepamais/posts/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45z" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/xepa_mais/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zM17.3 5.5a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4zM12 2c-2.7 0-3 0-4.1.1-3 .1-4.7 1.8-4.8 4.8C3 8 3 8.3 3 12s0 4 .1 5.1c.1 3 1.8 4.7 4.8 4.8C9 22 9.3 22 12 22s3 0 4.1-.1c3-.1 4.7-1.8 4.8-4.8.1-1.1.1-1.4.1-5.1s0-4-.1-5.1c-.1-3-1.8-4.7-4.8-4.8C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1 2.2.1 3.2 1.1 3.3 3.3.1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.2-1.1 3.2-3.3 3.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.2-.1-3.2-1.1-3.3-3.3-.1-1-.1-1.3-.1-4s0-3 .1-4C4.8 5 5.8 4 8 3.9c1-.1 1.3-.1 4-.1z" />
              </svg>
            </a>
            <a
              href="https://github.com/XepaMais"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .3a12 12 0 00-3.8 23.38c.6.12.83-.26.83-.57v-2.23c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18a4.65 4.65 0 011.23 3.22c0 4.61-2.8 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .31.21.69.82.57A12 12 0 0012 .3" />
              </svg>
            </a>
          </div>
        </div>

        <nav
          className={`${Styles.colunas} ${areaFeirante ? Styles.colunasFeirante : ''}`}
          aria-label="Links do rodapé"
        >
          {colunas.map((coluna) => (
            <div className={Styles.coluna} key={coluna.titulo}>
              <h3>{coluna.titulo}</h3>
              <ul>
                {coluna.links.map((link) => (
                  <li key={link.texto}>
                    <LinkRodape to={link.destino}>
                      {link.texto}
                      {link.contador === 'pendentes' && pendentes > 0 && (
                        <span
                          className={Styles.contador}
                          aria-label={`${pendentes} ${pendentes === 1 ? 'pedido' : 'pedidos'} para retirar`}
                        >
                          {pendentes}
                        </span>
                      )}
                    </LinkRodape>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={Styles.base}>
        <span>© 2026 Xepa+ Todos os direitos reservados.</span>
        <div className={Styles.legal}>
          <LinkRodape to="/termos-de-uso">Termos de uso</LinkRodape>
          <LinkRodape to="/privacidade">Diretrizes de Privacidade</LinkRodape>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
