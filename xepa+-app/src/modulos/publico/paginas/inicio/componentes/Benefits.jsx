import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Apple, Carrot, LeafyGreen, Sprout } from 'lucide-react';
import '@/modulos/publico/paginas/inicio/estilos/Benefits.css';

import '@google/model-viewer';


import Rabisco from '@/modulos/publico/paginas/inicio/componentes/Rabisco.jsx';

// A ordem define a posição: no computador, 1 e 3 ficam à esquerda da caixa e 2 e 4 à direita;
// no celular, as quatro formam uma grade 2 x 2 abaixo dela.
const categorias = [
  { nome: 'Legumes', Icone: Carrot, cor: 'laranja' },
  { nome: 'Verduras', Icone: LeafyGreen, cor: 'verde' },
  { nome: 'Frutas', Icone: Apple, cor: 'verde' },
  { nome: 'Temperos', Icone: Sprout, cor: 'laranja' },
];

export default function Benefits() {
  const secaoRef = useRef(null);
  // 'parado': sem animação (movimento reduzido) | 'aguardando': escondido até a seção aparecer
  // | 'visivel': anima
  const [etapa, setEtapa] = useState(() => {
    const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduzir || !('IntersectionObserver' in window) ? 'parado' : 'aguardando';
  });

  // A animação roda uma vez só, quando a seção chega à tela
  useEffect(() => {
    if (etapa !== 'aguardando') return undefined;

    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas[0].isIntersecting) {
          setEtapa('visivel');
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(secaoRef.current);
    return () => observer.disconnect();
  }, [etapa]);

  const classes = [
    'secao-beneficios',
    etapa !== 'parado' ? 'secao-beneficios--animada' : '',
    etapa === 'visivel' ? 'secao-beneficios--visivel' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section ref={secaoRef} className={classes} id="beneficios">
      <header className="cabecalho-beneficios" data-revelar>
        <h2>
          O que você vai <Rabisco>receber</Rabisco>
        </h2>

        <p>
          Com o Xepa+, você encontra alimentos frescos, economiza nas compras e ajuda a reduzir o
          desperdício nas feiras.
        </p>

        <Link to="/CriarConta" className="botao-beneficios">
          Criar minha conta
        </Link>
      </header>

      <div className="ilustracao-beneficios" data-revelar="zoom" style={{ '--atraso': '0.15s' }}>
        {/* Modelo 3D da cesta (fica em public/modelos). A imagem antiga aparece enquanto carrega. */}
        <model-viewer
          class="cesta-beneficios"
          src="/modelos/cesta-xepa.glb"
          alt="Cesta de alimentos do Xepa+ em 3D"
          camera-controls
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="20deg"
          disable-zoom
          interaction-prompt="none"
          shadow-intensity="1"
          exposure="1"
          loading="lazy"
        />

        {categorias.map(({ nome, Icone, cor }, indice) => (
          <div
            key={nome}
            className={`categoria-beneficio categoria-beneficio--${cor}`}
            style={{ '--ordem': indice, gridArea: `c${indice + 1}` }}
          >
            <span className="categoria-beneficio__icone" aria-hidden="true">
              <Icone size={22} strokeWidth={2.2} />
            </span>
            <strong className="categoria-beneficio__nome">{nome}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
