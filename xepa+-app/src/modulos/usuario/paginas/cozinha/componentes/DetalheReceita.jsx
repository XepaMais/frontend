import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ChefHat, Clock3, Lightbulb, Printer, Share2, Users } from 'lucide-react';
import Style from '@/modulos/usuario/paginas/cozinha/estilos/DetalheReceita.module.css';
import {
  buscarReceitas,
  caminhoDaReceita,
  RECEITAS_PADRAO,
  receitaLocal,
} from '@/modulos/usuario/paginas/cozinha/dados/receitas';

function Informacoes({ receita }) {
  const itens = [
    { Icone: Clock3, rotulo: 'Tempo de preparo', valor: receita.tempo },
    { Icone: Users, rotulo: 'Rendimento', valor: receita.rendimento },
    { Icone: ChefHat, rotulo: 'Dificuldade', valor: receita.dificuldade },
  ].filter((item) => item.valor);

  return (
    <dl className={Style.infos}>
      {itens.map(({ Icone, rotulo, valor }) => (
        <div key={rotulo} className={Style.info}>
          <Icone size={22} strokeWidth={1.7} aria-hidden="true" />
          <dt>{rotulo}</dt>
          <dd>{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Ingredientes({ grupos }) {
  const [marcados, setMarcados] = useState({});
  const temItens = grupos.some((grupo) => grupo.itens?.length);

  function alternar(chave) {
    setMarcados((atual) => ({ ...atual, [chave]: !atual[chave] }));
  }

  return (
    <section className={Style.ingredientes} aria-labelledby="titulo-ingredientes">
      <h2 id="titulo-ingredientes">Ingredientes</h2>

      {!temItens && <p className={Style.vazio}>Ingredientes ainda não cadastrados.</p>}

      {grupos.map((grupo, indiceGrupo) => (
        <div key={grupo.grupo || indiceGrupo} className={Style.grupo}>
          {grupo.grupo && <h3>{grupo.grupo}</h3>}
          <ul>
            {grupo.itens.map((item, indice) => {
              const chave = `${indiceGrupo}-${indice}`;
              return (
                <li key={chave}>
                  <label className={marcados[chave] ? Style.marcado : ''}>
                    <input type="checkbox" checked={!!marcados[chave]} onChange={() => alternar(chave)} />
                    <span>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}

function ModoPreparo({ passos, dica }) {
  const [feitos, setFeitos] = useState({});

  return (
    <section className={Style.preparo} aria-labelledby="titulo-preparo">
      <h2 id="titulo-preparo">Modo de preparo</h2>

      {passos.length === 0 ? (
        <p className={Style.vazio}>Modo de preparo ainda não cadastrado.</p>
      ) : (
        <ol>
          {passos.map((passo, indice) => (
            <li key={indice} className={feitos[indice] ? Style.feito : ''}>
              <button
                type="button"
                className={Style.numero}
                aria-pressed={!!feitos[indice]}
                aria-label={`Passo ${indice + 1}: marcar como ${feitos[indice] ? 'não feito' : 'feito'}`}
                onClick={() => setFeitos((atual) => ({ ...atual, [indice]: !atual[indice] }))}
              >
                {feitos[indice] ? '✓' : indice + 1}
              </button>
              <p>{passo}</p>
            </li>
          ))}
        </ol>
      )}

      {dica && (
        <aside className={Style.dica}>
          <Lightbulb size={22} strokeWidth={1.7} aria-hidden="true" />
          <div>
            <strong>Dica Xepa+</strong>
            <p>{dica}</p>
          </div>
        </aside>
      )}
    </section>
  );
}

function Relacionadas({ receitas, pathname }) {
  if (receitas.length === 0) return null;

  return (
    <section className={Style.relacionadas} aria-labelledby="titulo-relacionadas">
      <h2 id="titulo-relacionadas">Você também pode gostar</h2>
      <div className={Style.gradeRelacionadas}>
        {receitas.map((receita) => (
          <Link key={receita.codigo} to={caminhoDaReceita(pathname, receita.codigo)} className={Style.cardRelacionada}>
            <div className={Style.fotoRelacionada}>{receita.imagem && <img src={receita.imagem} alt="" />}</div>
            <div className={Style.textoRelacionada}>
              <span className={Style.tag}>{receita.categoria}</span>
              <h3>{receita.nome}</h3>
              <span className={Style.metaRelacionada}>
                ◷ {receita.tempo} · {receita.dificuldade}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// Escolhe até 4 receitas: primeiro as da mesma categoria, depois as que dividem ingredientes.
function receitasRelacionadas(receita, todas) {
  const outras = todas.filter((item) => item.codigo !== receita.codigo);
  const pontuar = (item) =>
    (item.categoria === receita.categoria ? 10 : 0) +
    item.ingredientes.filter((ingrediente) => receita.ingredientes.includes(ingrediente)).length;

  return outras
    .map((item) => ({ item, pontos: pontuar(item) }))
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 4)
    .map(({ item }) => item);
}

export default function DetalheReceita() {
  const { codigo } = useParams();
  const { pathname } = useLocation();
  const [receitas, setReceitas] = useState(RECEITAS_PADRAO);
  const [carregando, setCarregando] = useState(!receitaLocal(codigo));
  const [avisoCompartilhar, setAvisoCompartilhar] = useState('');

  const voltarPara = pathname.startsWith('/cozinha-home') ? '/cozinha-home' : '/cozinha';
  const receita = receitas.find((item) => item.codigo === codigo);

  useEffect(() => {
    let ativo = true;
    buscarReceitas().then((lista) => {
      if (!ativo) return;
      setReceitas(lista);
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (receita) document.title = `${receita.nome} | Receitas | Xepa+`;
  }, [receita]);

  async function compartilhar() {
    const dados = { title: receita.nome, text: `Olha essa receita da Xepa+: ${receita.nome}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(dados);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      setAvisoCompartilhar('Link copiado!');
    } catch {
      // Pessoa cancelou o compartilhamento: nada a fazer.
    }
    setTimeout(() => setAvisoCompartilhar(''), 2500);
  }

  if (!receita) {
    return (
      <main id="conteudo" className={Style.pagina}>
        <div className={Style.naoEncontrada}>
          {carregando ? (
            <p>Carregando receita…</p>
          ) : (
            <>
              <h1>Receita não encontrada</h1>
              <p>Ela pode ter sido removida ou o endereço está errado.</p>
              <Link to={voltarPara} className={Style.botaoPrincipal}>
                Ver todas as receitas
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main id="conteudo" className={Style.pagina}>
      <nav className={Style.trilha} aria-label="Você está em">
        <Link to={voltarPara} className={Style.voltar}>
          <ArrowLeft size={18} aria-hidden="true" /> Receitas
        </Link>
        <span aria-hidden="true">/</span>
        <span>{receita.categoria}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{receita.nome}</span>
      </nav>

      <header className={Style.topo}>
        <div className={Style.foto}>
          {receita.imagem ? <img src={receita.imagem} alt={receita.nome} /> : <span aria-hidden="true">🥗</span>}
        </div>

        <div className={Style.resumo}>
          <span className={Style.tag}>{receita.categoria}</span>
          <h1>{receita.nome}</h1>
          {receita.descricao && <p className={Style.descricao}>{receita.descricao}</p>}

          <Informacoes receita={receita} />

          <div className={Style.acoes}>
            <a
              href="#titulo-preparo"
              className={Style.botaoPrincipal}
              onClick={(evento) => {
                evento.preventDefault();
                document.getElementById('titulo-preparo')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Ir para o modo de preparo
            </a>
            <button type="button" className={Style.botaoSecundario} onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" /> Imprimir
            </button>
            <button type="button" className={Style.botaoSecundario} onClick={compartilhar}>
              <Share2 size={18} aria-hidden="true" /> Compartilhar
            </button>
            <span className={Style.aviso} role="status">
              {avisoCompartilhar}
            </span>
          </div>
        </div>
      </header>

      {/* key: ao abrir outra receita, os ingredientes/passos marcados começam limpos */}
      <div className={Style.conteudo} key={receita.codigo}>
        <Ingredientes grupos={receita.listaIngredientes || [{ itens: receita.ingredientes }]} />
        <ModoPreparo passos={receita.modoPreparo || []} dica={receita.dica} />
      </div>

      <Relacionadas receitas={receitasRelacionadas(receita, receitas)} pathname={pathname} />
    </main>
  );
}
