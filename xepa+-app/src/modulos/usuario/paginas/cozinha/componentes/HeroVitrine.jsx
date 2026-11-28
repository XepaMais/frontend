import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import videoCozinha from '@/assets/videos/cozinha-hero.mp4';
import Style from '@/modulos/usuario/paginas/cozinha/estilos/HeroVitrine.module.css';
import { caminhoDaReceita } from '@/modulos/usuario/paginas/cozinha/dados/receitas';

// Prato solto, visto de cima. Com PNG recortado (sem fundo) usa ele;
// senão, corta a foto em círculo com borda branca, como um prato.
function Prato({ receita }) {
  if (receita.recorte) {
    return (
      <div className={Style.prato}>
        <img src={receita.recorte} alt="" className={Style.recorte} />
      </div>
    );
  }

  return (
    <div className={Style.prato}>
      <div className={Style.pratoCirculo}>{receita.imagem && <img src={receita.imagem} alt="" />}</div>
    </div>
  );
}

// Divide o nome em 2 linhas mais ou menos do mesmo tamanho.
function duasLinhas(nome) {
  const palavras = nome.toUpperCase().split(' ');
  if (palavras.length === 1) return [nome.toUpperCase(), ''];
  let melhor = 1;
  let menorDiferenca = Infinity;
  for (let corte = 1; corte < palavras.length; corte += 1) {
    const diferenca = Math.abs(palavras.slice(0, corte).join(' ').length - palavras.slice(corte).join(' ').length);
    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      melhor = corte;
    }
  }
  return [palavras.slice(0, melhor).join(' '), palavras.slice(melhor).join(' ')];
}

const TEMPO_DESTAQUE = 5000;

// 1) Hero: nome gigante da receita com o prato passando por cima (troca sozinho).
function Destaque({ receitas, pathname }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = receitas.length;
  const receita = receitas[indice % total];

  useEffect(() => {
    if (pausado || total < 2) return undefined;
    const timer = setTimeout(() => setIndice((atual) => (atual + 1) % total), TEMPO_DESTAQUE);
    return () => clearTimeout(timer);
  }, [indice, pausado, total]);

  if (!receita) return null;

  const [linha1, linha2] = duasLinhas(receita.nome);
  // Tamanho da letra acompanha a linha mais comprida, para o nome caber em 2 linhas.
  const letras = Math.max(linha1.length, linha2.length, 6);
  const ir = (passo) => setIndice((atual) => (atual + passo + total) % total);

  return (
    <section
      className={Style.destaque}
      aria-roledescription="carrossel"
      aria-labelledby="titulo-hero"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <h1 id="titulo-hero" className={Style.tituloHero}>
        <span className={Style.ponto} aria-hidden="true" />
        <span>
          Receitas com o que você levou da <span className={Style.laranja}>feira</span>
        </span>
      </h1>

      <div className={Style.topoDestaque}>
        <span className={Style.mono}>
          {String((indice % total) + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <div className={Style.barra} aria-hidden="true">
          <span key={`${indice}-${pausado}`} className={pausado ? Style.barraParada : Style.barraAndando} />
        </div>
        <div className={Style.setas}>
          <button type="button" onClick={() => ir(-1)} aria-label="Receita anterior">
            <ArrowLeft size={18} />
          </button>
          <button type="button" onClick={() => ir(1)} aria-label="Próxima receita">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className={Style.palco} aria-live="polite">
        <h2 key={receita.codigo} className={Style.nomeGigante}
          style={{ '--letras': letras }}>
          <span>{linha1}</span>
          {linha2 && <span>{linha2}</span>}
        </h2>
        <Link
          key={`prato-${receita.codigo}`}
          to={caminhoDaReceita(pathname, receita.codigo)}
          className={Style.pratoDestaque}
          aria-label={`Ver receita: ${receita.nome}`}
        >
          <Prato receita={receita} />
        </Link>
      </div>

      <div className={Style.rodapeDestaque}>
        <p>
          {receita.categoria}
          <br />
          <span>{receita.tempo} · {receita.dificuldade}</span>
        </p>
        <Link to={caminhoDaReceita(pathname, receita.codigo)} className={Style.verReceita}>
          Ver receita <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <p className={Style.direita}>
          Feito com xepa
          <br />
          <span>da feira pra sua mesa</span>
        </p>
      </div>
    </section>
  );
}

// 2) Manifesto: vídeo em tela cheia com a frase grande por cima.
function Manifesto() {
  return (
    <section className={Style.manifesto} aria-labelledby="titulo-manifesto">
      <video src={videoCozinha} autoPlay loop muted playsInline aria-hidden="true" />
      <div className={Style.veu} aria-hidden="true" />
      <span className={`${Style.mono} ${Style.etiquetaManifesto}`}>● 0% DESPERDÍCIO</span>
      <h2 id="titulo-manifesto">
        Da feira pra mesa,
        <br />
        uma receita de cada vez.
      </h2>
      <a
        href="#receitas"
        className={Style.botaoManifesto}
        onClick={(evento) => {
          evento.preventDefault();
          document.getElementById('receitas')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Encontrar minha próxima receita <ArrowRight size={16} aria-hidden="true" />
      </a>
    </section>
  );
}

export default function HeroVitrine({ receitas }) {
  const { pathname } = useLocation();

  return (
    <>
      <Destaque receitas={receitas} pathname={pathname} />
      <Manifesto />
    </>
  );
}
