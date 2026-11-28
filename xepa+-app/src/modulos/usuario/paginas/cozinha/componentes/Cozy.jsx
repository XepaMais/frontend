import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CakeSlice, Clock3, GlassWater, Grid2X2, Leaf, Salad, Soup } from 'lucide-react';
import ScrollReveal from 'scrollreveal';
import videoCozinha from '@/assets/videos/cozinha-hero.mp4';
import Style from '@/modulos/usuario/paginas/cozinha/estilos/Cozy.module.css';
import HeroVitrine from '@/modulos/usuario/paginas/cozinha/componentes/HeroVitrine';
import { buscarReceitas, caminhoDaReceita, RECEITAS_PADRAO } from '@/modulos/usuario/paginas/cozinha/dados/receitas';

// true = novo topo "vitrine" (potes flutuando + destaque + vídeo). false = topo antigo.
const USAR_TOPO_VITRINE = true;

const categorias = ['Todas', 'Saladas', 'Sopas', 'Doces', 'Sucos', 'Aproveitamento integral', 'Rápidas'];

// Quantas receitas aparecem antes de clicar em "Ver mais receitas".
const RECEITAS_POR_VEZ = 8;

const iconesCategoria = {
  Todas: Grid2X2,
  Saladas: Salad,
  Sopas: Soup,
  Doces: CakeSlice,
  Sucos: GlassWater,
  'Aproveitamento integral': Leaf,
  Rápidas: Clock3,
};

// Deixa o texto minúsculo para comparar sem se preocupar com maiúsculas
const normalizar = (texto) => texto.trim().toLocaleLowerCase('pt-BR');

// A receita é da categoria escolhida?
function bateComCategoria(receita, categoria) {
  return categoria === 'Todas' || receita.categoria === categoria;
}

// A receita usa pelo menos um dos ingredientes da sacola?
function bateComIngredientes(receita, ingredientesEscolhidos) {
  if (ingredientesEscolhidos.length === 0) return true;

  return ingredientesEscolhidos.some((escolhido) =>
    receita.ingredientes.some((ingrediente) => normalizar(ingrediente).includes(escolhido) || escolhido.includes(normalizar(ingrediente)))
  );
}

function Hero() {
  const heroImageRef = useRef(null);
  const heroCopy = useRef(null);
  const morangosRef = useRef(null);

  useEffect(() => {
    const reveal = ScrollReveal();
    const targets = [heroImageRef.current, heroCopy.current, morangosRef.current].filter(Boolean);

    reveal.reveal(heroImageRef.current, {
      origin: 'right',
      duration: 3000,
      distance: '40%',
    });
    reveal.reveal(morangosRef.current, {
      origin: 'right',
      duration: 3000,
      distance: '60%',
    });
    reveal.reveal(heroCopy.current, {
      origin: 'left',
      duration: 3000,
      distance: '40%',
    });

    return () => targets.forEach((target) => reveal.clean(target));
  }, []);

  return (
    <section className={Style.hero} id="inicio">
      <div ref={heroCopy} className={Style.heroCopy}>
        <h1>Receitas com o que você levou da <span className={Style.spanhero}>feira</span></h1>
        <p>Uma sacola cheia de possibilidades. Encontre um jeito gostoso de aproveitar cada ingrediente.</p>
        <a href="#receitas" className={Style.heroLink}>
          Encontrar minha próxima receita <span>→</span>
        </a>
      </div>

      <div ref={heroImageRef} className={Style.heroImage}>
        <video
          src={videoCozinha}
          autoPlay
          loop
          muted
          playsInline
          aria-label="Vídeo de alimentos frescos para a cozinha"
        />
        <span className={Style.photoCaption}>
          Receitas para aproveitar <b>●</b> da feira pra sua mesa
        </span>
      </div>
    </section>
  );
}

function CategoryFilters({ categoriaAtual, setCategoria }) {
  return (
    <div className={Style.filters} role="group" aria-label="Filtrar por categoria">
      {categorias.map((nome) => {
        const Icone = iconesCategoria[nome];
        const classe = nome === categoriaAtual ? `${Style.filter} ${Style.selected}` : Style.filter;

        return (
          <button key={nome} type="button" className={classe} onClick={() => setCategoria(nome)}>
            <Icone className={Style.filterIcon} size={21} strokeWidth={1.7} aria-hidden="true" />
            {nome}
          </button>
        );
      })}
    </div>
  );
}

function IngredientPicker({ ingredientes, setIngredientes }) {
  function adicionar(event) {
    event.preventDefault();
    const campo = event.currentTarget.elements.ingrediente;
    const nome = normalizar(campo.value);

    if (nome && !ingredientes.includes(nome)) {
      setIngredientes([...ingredientes, nome]);
    }
    campo.value = '';
  }

  function remover(nome) {
    setIngredientes(ingredientes.filter((item) => item !== nome));
  }

  function irParaReceitas() {
    document.getElementById('receitas').scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <section className={Style.pantry}>
      <div>
        <span className={Style.eyebrow}>ENCONTRE SUA PRÓXIMA IDEIA</span>
        <h2>O que você comprou?</h2>
        <p>Adicione o que veio na sua sacola e descubra o que preparar.</p>
      </div>

      <div className={Style.pantryForm}>
        <form onSubmit={adicionar} className={Style.add}>
          <span>＋</span>
          <input name="ingrediente" placeholder="Digite um ingrediente e aperte Enter" aria-label="Adicionar ingrediente" />
          <button type="submit">Adicionar</button>
        </form>

        {ingredientes.length > 0 && (
          <div className={Style.chips} aria-label="Ingredientes escolhidos">
            {ingredientes.map((item) => (
              <button type="button" key={item} className={Style.chip} onClick={() => remover(item)}>
                {item}
                <span aria-label={`Remover ${item}`}>×</span>
              </button>
            ))}
          </div>
        )}

        <button className={Style.match} type="button" onClick={irParaReceitas}>
          Ver receitas possíveis <span>→</span>
        </button>
      </div>
    </section>
  );
}

function RecipeCard({ receita }) {
  const { pathname } = useLocation();

  return (
    <article className={Style.card}>
      <Link to={caminhoDaReceita(pathname, receita.codigo)} className={Style.cardLink}>
        <div className={Style.cardImage}>
          {receita.imagem ? <img src={receita.imagem} alt="" /> : <span aria-hidden="true">🥗</span>}
        </div>

        <div className={Style.cardBody}>
          <span className={Style.tag}>{receita.categoria}</span>
          <h3>{receita.nome}</h3>

          <div className={Style.meta}>
            <span>◷ {receita.tempo}</span>
            <span aria-hidden="true">·</span>
            <span>{receita.dificuldade}</span>
          </div>

          <div className={Style.ingredients}>{receita.ingredientes.join(' · ')}</div>
          <span className={Style.verReceita}>
            Ver receita <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}

function RecipeGrid({ lista }) {
  if (lista.length === 0) {
    return (
      <div className={Style.grid}>
        <div className={Style.empty}>
          <strong>Nenhuma receita por aqui ainda</strong>
          Experimente outro ingrediente ou categoria.
        </div>
      </div>
    );
  }

  return (
    <div className={Style.grid}>
      {lista.map((receita) => (
        <RecipeCard key={receita.codigo || receita.nome} receita={receita} />
      ))}
    </div>
  );
}

// Página principal: guarda o estado e junta todos os blocos.

export default function Cozy() {
  const [categoria, setCategoria] = useState('Todas');
  const [ingredientes, setIngredientes] = useState([]);
  const [receitas, setReceitas] = useState(RECEITAS_PADRAO);
  const [quantidadeVisivel, setQuantidadeVisivel] = useState(RECEITAS_POR_VEZ);

  // Receitas cadastradas no banco (novas receitas aparecem sem mudar o site).
  useEffect(() => {
    let ativo = true;
    buscarReceitas().then((lista) => {
      if (ativo) setReceitas(lista);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Trocou o filtro: volta a mostrar só a primeira leva.
  function trocarCategoria(nova) {
    setCategoria(nova);
    setQuantidadeVisivel(RECEITAS_POR_VEZ);
  }

  function trocarIngredientes(novos) {
    setIngredientes(novos);
    setQuantidadeVisivel(RECEITAS_POR_VEZ);
  }

  // Só ficam as receitas que passam nos filtros de categoria e ingredientes
  const receitasFiltradas = receitas.filter(
    (receita) =>
      bateComCategoria(receita, categoria) &&
      bateComIngredientes(receita, ingredientes)
  );
  const receitasVisiveis = receitasFiltradas.slice(0, quantidadeVisivel);
  const temMais = receitasFiltradas.length > quantidadeVisivel;

  return (
    <div className={Style.page}>
      {USAR_TOPO_VITRINE ? <HeroVitrine receitas={receitas} /> : <Hero />}

      <main>
        <section className={Style.recipes} id="receitas">
          <CategoryFilters categoriaAtual={categoria} setCategoria={trocarCategoria} />
          <IngredientPicker ingredientes={ingredientes} setIngredientes={trocarIngredientes} />

          <div className={Style.sectionHeading}>
            <div>
              <span className={Style.eyebrow}>INSPIRAÇÃO PARA HOJE</span>
              <h2>Receitas para aproveitar</h2>
              <p>Pratos simples, ingredientes frescos e sem desperdício.</p>
            </div>
            <span className={Style.count}>
              {receitasFiltradas.length} {receitasFiltradas.length === 1 ? 'receita' : 'receitas'}
            </span>
          </div>

          <RecipeGrid lista={receitasVisiveis} />

          {temMais && (
            <button
              className={Style.more}
              type="button"
              onClick={() => setQuantidadeVisivel((atual) => atual + RECEITAS_POR_VEZ)}
            >
              Ver mais receitas <span>→</span>
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
