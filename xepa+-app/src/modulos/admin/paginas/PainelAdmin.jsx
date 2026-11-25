import { useCallback, useEffect, useState } from 'react';
import { Database, LogOut, Pencil, Plus, RefreshCw, Search, Trash2, Users, X } from 'lucide-react';
import {
  SESSAO_EXPIRADA,
  atualizarLinha,
  excluirLinha,
  inserirLinha,
  listarLinhas,
  listarTabelas,
  sairAdmin,
} from '@/modulos/admin/servicos/adminApi';
import UsuariosAdmin from './UsuariosAdmin';
import estilos from './Admin.module.css';

const TAMANHO_PAGINA = 25;

function formatarValor(valor) {
  if (valor === null || valor === undefined) return <span className={estilos.nulo}>NULL</span>;
  if (typeof valor === 'boolean') return valor ? 'true' : 'false';
  const texto = String(valor);
  return texto.length > 80 ? `${texto.slice(0, 80)}…` : texto;
}

function PainelAdmin({ aoSair }) {
  const [tabelas, setTabelas] = useState([]);
  const [tabelaAtual, setTabelaAtual] = useState('');
  const [dados, setDados] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  const [formulario, setFormulario] = useState(null); // { modo: 'novo' | 'editar', linha }
  const [excluindo, setExcluindo] = useState(null); // linha a excluir

  const sair = useCallback(() => {
    sairAdmin();
    aoSair();
  }, [aoSair]);

  const tratarErro = useCallback(
    (falha) => {
      if (falha.message === SESSAO_EXPIRADA) sair();
      else setErro(falha.message);
    },
    [sair],
  );

  const carregarTabelas = useCallback(() => {
    listarTabelas()
      .then(setTabelas)
      .catch(tratarErro);
  }, [tratarErro]);

  const carregarLinhas = useCallback(() => {
    if (!tabelaAtual) return;
    listarLinhas(tabelaAtual, { pagina, tamanho: TAMANHO_PAGINA, busca: buscaAplicada })
      .then((resultado) => {
        setDados(resultado);
        setErro('');
      })
      .catch(tratarErro);
  }, [tabelaAtual, pagina, buscaAplicada, tratarErro]);

  useEffect(carregarTabelas, [carregarTabelas]);
  useEffect(carregarLinhas, [carregarLinhas]);

  function escolherTabela(nome) {
    setTabelaAtual(nome);
    setPagina(0);
    setBusca('');
    setBuscaAplicada('');
    setDados(null);
    setAviso('');
  }

  function buscar(evento) {
    evento.preventDefault();
    setPagina(0);
    setBuscaAplicada(busca);
  }

  function recarregar() {
    carregarTabelas();
    carregarLinhas();
  }

  function mostrarAviso(texto) {
    setAviso(texto);
    setTimeout(() => setAviso(''), 3500);
  }

  const colunas = dados?.colunas ?? [];
  const chave = colunas.filter((c) => c.chavePrimaria);
  const chaveUnica = chave.length === 1 ? chave[0].nome : null;
  const totalPaginas = dados ? Math.max(1, Math.ceil(dados.total / dados.tamanho)) : 1;

  async function salvar(valores) {
    try {
      if (formulario.modo === 'novo') {
        await inserirLinha(tabelaAtual, valores);
        mostrarAviso('Registro criado.');
      } else {
        await atualizarLinha(tabelaAtual, formulario.linha[chaveUnica], valores);
        mostrarAviso('Registro atualizado.');
      }
      setFormulario(null);
      recarregar();
    } catch (falha) {
      if (falha.message === SESSAO_EXPIRADA) sair();
      throw falha;
    }
  }

  async function confirmarExclusao() {
    try {
      await excluirLinha(tabelaAtual, excluindo[chaveUnica]);
      setExcluindo(null);
      mostrarAviso('Registro excluído.');
      recarregar();
    } catch (falha) {
      setExcluindo(null);
      tratarErro(falha);
    }
  }

  return (
    <div className={estilos.painel}>
      <aside className={estilos.lateral}>
        <div className={estilos.marca}>
          <Database size={20} />
          <span>Xepa+ Admin</span>
        </div>
        <button
          type="button"
          className={`${estilos.itemTabela} ${estilos.itemUsuarios} ${!tabelaAtual ? estilos.itemAtivo : ''}`}
          onClick={() => escolherTabela('')}
        >
          <span className={estilos.itemIcone}>
            <Users size={16} /> Usuários
          </span>
        </button>
        <p className={estilos.rotuloLateral}>Tabelas ({tabelas.length})</p>
        <nav className={estilos.listaTabelas}>
          {tabelas.map((t) => (
            <button
              key={t.nome}
              type="button"
              className={`${estilos.itemTabela} ${t.nome === tabelaAtual ? estilos.itemAtivo : ''}`}
              onClick={() => escolherTabela(t.nome)}
            >
              <span>{t.nome}</span>
              <span className={estilos.contagem}>{t.linhas}</span>
            </button>
          ))}
        </nav>
        <button type="button" className={estilos.botaoSair} onClick={sair}>
          <LogOut size={16} /> Sair
        </button>
      </aside>

      <main className={estilos.conteudo}>
        {!tabelaAtual ? (
          <>
            {erro && (
              <div className={estilos.faixaErro}>
                {erro}
                <button type="button" onClick={() => setErro('')} aria-label="Fechar">
                  <X size={14} />
                </button>
              </div>
            )}
            <UsuariosAdmin aoErro={tratarErro} />
          </>
        ) : (
          <>
        <header className={estilos.topo}>
          <div>
            <h1>{tabelaAtual || 'Selecione uma tabela'}</h1>
            {dados && (
              <p className={estilos.subtitulo}>
                {dados.total} registro{dados.total === 1 ? '' : 's'}
                {buscaAplicada && ` para “${buscaAplicada}”`}
              </p>
            )}
          </div>
          <div className={estilos.acoesTopo}>
            <form className={estilos.busca} onSubmit={buscar}>
              <Search size={16} />
              <input
                placeholder="Buscar em todas as colunas"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </form>
            <button type="button" className={estilos.botaoIcone} onClick={recarregar} title="Recarregar">
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              className={estilos.botaoPrimario}
              onClick={() => setFormulario({ modo: 'novo', linha: {} })}
              disabled={!dados}
            >
              <Plus size={16} /> Novo registro
            </button>
          </div>
        </header>

        {erro && (
          <div className={estilos.faixaErro}>
            {erro}
            <button type="button" onClick={() => setErro('')} aria-label="Fechar">
              <X size={14} />
            </button>
          </div>
        )}
        {aviso && <div className={estilos.faixaAviso}>{aviso}</div>}

        <div className={estilos.areaTabela}>
          {dados && (
            <table className={estilos.tabela}>
              <thead>
                <tr>
                  {colunas.map((c) => (
                    <th key={c.nome} title={c.tipo}>
                      {c.chavePrimaria && <span className={estilos.chave}>PK</span>}
                      {c.nome}
                      <span className={estilos.tipo}>{c.tipo}</span>
                    </th>
                  ))}
                  <th className={estilos.colunaAcoes} />
                </tr>
              </thead>
              <tbody>
                {dados.linhas.map((linha, i) => (
                  <tr key={chaveUnica ? linha[chaveUnica] : i}>
                    {colunas.map((c) => (
                      <td key={c.nome} title={linha[c.nome] == null ? '' : String(linha[c.nome])}>
                        {formatarValor(linha[c.nome])}
                      </td>
                    ))}
                    <td className={estilos.colunaAcoes}>
                      {chaveUnica && (
                        <>
                          <button
                            type="button"
                            className={estilos.botaoLinha}
                            onClick={() => setFormulario({ modo: 'editar', linha })}
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className={`${estilos.botaoLinha} ${estilos.perigo}`}
                            onClick={() => setExcluindo(linha)}
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {dados.linhas.length === 0 && (
                  <tr>
                    <td colSpan={colunas.length + 1} className={estilos.vazio}>
                      Nenhum registro encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
          {tabelaAtual && !dados && !erro && <p className={estilos.vazio}>Carregando…</p>}
        </div>

        {dados && (
          <footer className={estilos.paginacao}>
            <button type="button" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)}>
              Anterior
            </button>
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <button
              type="button"
              disabled={pagina + 1 >= totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </button>
          </footer>
        )}
          </>
        )}
      </main>

      {formulario && (
        <FormularioLinha
          modo={formulario.modo}
          tabela={tabelaAtual}
          colunas={colunas}
          linha={formulario.linha}
          aoFechar={() => setFormulario(null)}
          aoSalvar={salvar}
        />
      )}

      {excluindo && (
        <div className={estilos.fundoModal} onClick={() => setExcluindo(null)}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Excluir registro?</h2>
            <p>
              O registro <strong>{chaveUnica} = {String(excluindo[chaveUnica])}</strong> da tabela{' '}
              <strong>{tabelaAtual}</strong> será apagado do banco. Isso não pode ser desfeito.
            </p>
            <div className={estilos.acoesModal}>
              <button type="button" className={estilos.botaoSecundario} onClick={() => setExcluindo(null)}>
                Cancelar
              </button>
              <button type="button" className={estilos.botaoPerigo} onClick={confirmarExclusao}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormularioLinha({ modo, tabela, colunas, linha, aoFechar, aoSalvar }) {
  const editaveis = colunas.filter((c) => !c.oculta && !(modo === 'editar' && c.chavePrimaria));
  const [valores, setValores] = useState(() =>
    Object.fromEntries(editaveis.map((c) => [c.nome, linha[c.nome] == null ? '' : String(linha[c.nome])])),
  );
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setSalvando(true);
    // Na edição, manda só o que mudou.
    const envio =
      modo === 'editar'
        ? Object.fromEntries(
            Object.entries(valores).filter(
              ([nome, v]) => v !== (linha[nome] == null ? '' : String(linha[nome])),
            ),
          )
        : valores;
    if (modo === 'editar' && Object.keys(envio).length === 0) {
      aoFechar();
      return;
    }
    try {
      await aoSalvar(envio);
    } catch (falha) {
      setErro(falha.message);
      setSalvando(false);
    }
  }

  const ocultas = colunas.filter((c) => c.oculta);

  return (
    <div className={estilos.fundoModal} onClick={aoFechar}>
      <form className={`${estilos.modal} ${estilos.modalLargo}`} onClick={(e) => e.stopPropagation()} onSubmit={enviar}>
        <h2>
          {modo === 'novo' ? 'Novo registro' : 'Editar registro'} · {tabela}
        </h2>
        <div className={estilos.gradeCampos}>
          {editaveis.map((c) => (
            <label key={c.nome} className={estilos.campo}>
              <span>
                {c.nome} <small>{c.tipo}{c.autoIncremento ? ' · automático' : ''}{c.anulavel ? '' : ' · obrigatório'}</small>
              </span>
              <input
                value={valores[c.nome]}
                onChange={(e) => setValores((v) => ({ ...v, [c.nome]: e.target.value }))}
                placeholder={c.anulavel || c.autoIncremento ? 'vazio = NULL' : ''}
              />
            </label>
          ))}
        </div>
        {ocultas.length > 0 && (
          <p className={estilos.dica}>
            Campos sensíveis ({ocultas.map((c) => c.nome).join(', ')}) não aparecem nem podem ser alterados aqui.
          </p>
        )}
        {erro && <p className={estilos.erro}>{erro}</p>}
        <div className={estilos.acoesModal}>
          <button type="button" className={estilos.botaoSecundario} onClick={aoFechar}>
            Cancelar
          </button>
          <button type="submit" className={estilos.botaoPrimario} disabled={salvando}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PainelAdmin;
