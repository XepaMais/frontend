import { useNavigate } from 'react-router-dom';
import Header from '@/modulos/publico/paginas/inicio/componentes/Header.jsx';
import Hero from '@/modulos/publico/paginas/inicio/componentes/Hero.jsx';
import About from '@/modulos/publico/paginas/inicio/componentes/About.jsx';
import HowItWorks from '@/modulos/publico/paginas/inicio/componentes/HowItWorks.jsx';
import Benefits from '@/modulos/publico/paginas/inicio/componentes/Benefits.jsx';
import PlanosFeirante from '@/modulos/publico/paginas/inicio/componentes/PlanosFeirante.jsx';
import MapaFeiras from '@/modulos/publico/paginas/inicio/componentes/MapaFeiras.jsx';
import PerguntasFrequentes from '@/modulos/publico/paginas/inicio/componentes/PerguntasFrequentes.jsx';
import Propaganda from '@/modulos/publico/paginas/inicio/componentes/Propaganda.jsx';
import FaixaXepa from '@/modulos/publico/paginas/inicio/componentes/FaixaXepa.jsx';
import useRevelarAoRolar from '@/modulos/publico/paginas/inicio/ganchos/useRevelarAoRolar.js';
import useEscalaTela from '@/modulos/publico/paginas/inicio/ganchos/useEscalaTela.js';
import '@/modulos/publico/paginas/inicio/estilos/Animacoes.css';
import '@/modulos/publico/paginas/inicio/estilos/EscalaTela.css';

// Palavras da faixa laranja, entre a propaganda e os planos
const PALAVRAS_FEIRANTE = [
  'Divulgue sua banca',
  'Xepa+',
  'Venda mais',
  'Clientes da região',
  'Menos desperdício',
  'Preço justo',
  'Feira fresquinha',
];

function HomePrincipal() {
  const navigate = useNavigate();

  // Liga as animações de entrada de todas as seções da Home
  useRevelarAoRolar();

  // No computador, o conteúdo das seções cresce para preencher monitores maiores
  useEscalaTela();

  return (
    <>
      <Header />

      <main>
        <Hero />
        <About />
        <HowItWorks />
        <Benefits />
        <Propaganda onDivulgar={() => navigate('/cadastro/feirante')} />
        <FaixaXepa palavras={PALAVRAS_FEIRANTE} cor="laranja" />
        <PlanosFeirante onComprar={() => navigate('/cadastro/feirante')} />
        <MapaFeiras />
        <PerguntasFrequentes />
      </main>
    </>
  );
}

export default HomePrincipal;
