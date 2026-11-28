import '@/modulos/publico/paginas/inicio/estilos/About.css';
import { useNavigate } from 'react-router-dom';
import Rabisco from '@/modulos/publico/paginas/inicio/componentes/Rabisco.jsx';
import videoFeira from '@/assets/videos/VideoFeira.mp4';

export default function About() {
  const navigate = useNavigate();

  return (
    <section className="secao-sobre" id="sobre">
      <div className="sobre-container">
        <div className="sobre-conteudo">
          <h2 className="sobre-titulo" data-revelar>
            <span className="sobre-titulo__linha">Um projeto contra o</span>{' '}
            <span className="sobre-titulo__linha">
              <Rabisco>desperdício</Rabisco> nas feiras
            </span>
          </h2>

          <p className="sobre-texto" data-revelar style={{ '--atraso': '0.08s' }}>
            Somos estudantes que se uniram para dar um novo destino à <strong>xepa</strong>: os
            alimentos que sobram no fim da feira e ainda estão ótimos para o consumo.
          </p>

          <p className="sobre-texto" data-revelar style={{ '--atraso': '0.16s' }}>
            Conectamos feirantes e consumidores para que esses alimentos cheguem à mesa, e não ao
            lixo.
          </p>

          <div data-revelar style={{ '--atraso': '0.24s' }}>
            <button type="button" className="botao-sobre" onClick={() => navigate('/sobre-nos')}>
              Conheça nossa história
            </button>
          </div>
        </div>

        <figure className="sobre-video" data-revelar="direita" style={{ '--atraso': '0.15s' }}>
          <div className="sobre-video__moldura">
            <video src={`${videoFeira}#t=0.1`} controls preload="metadata" playsInline />
          </div>
          <figcaption>Vídeo gravado pela equipe Xepa+ na feira.</figcaption>
        </figure>
      </div>
    </section>
  );
}
