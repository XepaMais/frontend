import '@/modulos/publico/paginas/sobre-nos/estilos/Apresentacao.css';
import FrutasHero from '@/modulos/publico/paginas/sobre-nos/componentes/FrutasHero.jsx';

export default function Apresentacao() {
  return (
    <section className="sn-hero" aria-labelledby="sn-hero-titulo">
      <div className="sn-hero__conteudo">
        <h1 id="sn-hero-titulo" className="sn-hero__titulo">
          <span className="sn-hero__linha">Sobre nós</span>
        </h1>
        <p className="sn-hero__texto">
          Conectamos feirantes e consumidores para que o alimento da feira chegue à mesa, e não ao
          lixo.
        </p>
      </div>

      <FrutasHero />
    </section>
  );
}
