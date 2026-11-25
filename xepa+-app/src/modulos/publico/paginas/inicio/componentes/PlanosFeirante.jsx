import '@/modulos/publico/paginas/inicio/estilos/PlanosFeirante.css';
import { PLANOS } from '@/compartilhado/dados/planos';
import Rabisco from '@/modulos/publico/paginas/inicio/componentes/Rabisco.jsx';

// Resumo de cada plano só para a Home (os dados completos ficam em compartilhado/dados/planos)
const RESUMO = {
  gratis: {
    preco: 'R$ 0',
    topicos: [
      'Cadastro da banca, produtos e feiras',
      'Divulgação na plataforma',
      'Pedidos e conversas com clientes',
    ],
  },
  crescer: {
    preco: 'R$ 29,90',
    topicos: ['Tudo do plano Semente', 'Financeiro básico', 'Xep.AI'],
  },
  pro: {
    preco: 'R$ 59,90',
    topicos: [
      'Tudo do plano Broto',
      'Financeiro completo',
      'Destaque de produtos e suporte prioritário',
    ],
  },
};

export default function PlanosFeirante({ onComprar }) {
  return (
    <section className="planos-feirante" aria-labelledby="planos-titulo">
      <div className="planos-conteudo">
        <h2 id="planos-titulo" className="planos-titulo" data-revelar>
          Feirante, veja nossos <Rabisco cor="#f76019">Planos</Rabisco>
        </h2>

        <p className="planos-subtitulo" data-revelar style={{ '--atraso': '0.08s' }}>
          Os planos são exclusivos para <strong>feirantes</strong> que querem divulgar sua banca.
        </p>

        <div className="planos-lista">
          {PLANOS.map((plano, indice) => {
            const resumo = RESUMO[plano.id];

            return (
              <article
                key={plano.id}
                className={`plano-card plano-card--${plano.id}`}
                data-revelar
                style={{ '--atraso': `${0.1 + indice * 0.12}s` }}
              >
                <h3 className="plano-nome">Plano {plano.nome}</h3>

                <p className="plano-preco">
                  {resumo.preco}
                  <span className="plano-periodo">/mês</span>
                </p>

                <span className="plano-taxa">{Math.round(plano.taxa * 100)}% por venda</span>

                <ul className="plano-topicos">
                  {resumo.topicos.map((topico) => (
                    <li key={topico}>{topico}</li>
                  ))}
                </ul>

                <button type="button" className="plano-botao" onClick={onComprar}>
                  {plano.id === 'gratis' ? 'Começar grátis' : 'Assinar plano'}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
