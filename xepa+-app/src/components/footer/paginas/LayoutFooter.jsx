import { useEffect } from 'react';
import Header from '@/modulos/publico/paginas/inicio/componentes/Header.jsx';
import FaixaXepa from '@/modulos/publico/paginas/inicio/componentes/FaixaXepa.jsx';
import useRevelarAoRolar from '@/modulos/publico/paginas/inicio/ganchos/useRevelarAoRolar.js';
import '@/modulos/publico/paginas/inicio/estilos/Animacoes.css';
import FrutasHero from '@/modulos/publico/paginas/sobre-nos/componentes/FrutasHero.jsx';
import Base from './estilos/PaginaFooter.module.css';

const PALAVRAS_PADRAO = [
  'Xepa+',
  'Menos desperdício',
  'Feira fresquinha',
  'Preço justo',
  'Mais comida na mesa',
];

// Estrutura comum das páginas do rodapé (padrão do Sobre nós).
// "titulo" pode ser um texto ou uma lista de linhas (cada linha vira uma faixa verde).
function LayoutFooter({ titulo, descricao, palavras = PALAVRAS_PADRAO, children }) {
  // Sempre começa do topo.
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Liga as animações de entrada (data-revelar), como na Home
  useRevelarAoRolar();

  const linhas = Array.isArray(titulo) ? titulo : [titulo];

  return (
    <>
      <Header />

      <main className={Base.pagina}>
        <section className={Base.hero}>
          <div className={Base.heroConteudo}>
            <h1 className={Base.titulo} aria-label={linhas.join(' ')}>
              {linhas.map((linha) => (
                <span key={linha} className={Base.tituloLinha} aria-hidden="true">
                  {linha}
                </span>
              ))}
            </h1>
            {descricao && <p className={Base.descricao}>{descricao}</p>}
          </div>

          <FrutasHero />
        </section>

        <FaixaXepa palavras={palavras} />

        {children}
      </main>
    </>
  );
}

export default LayoutFooter;
