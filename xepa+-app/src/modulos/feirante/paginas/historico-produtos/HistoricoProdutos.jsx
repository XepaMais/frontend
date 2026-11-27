import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package } from 'lucide-react';
import {
  carregarProdutos,
  excluirProduto,
  sincronizarProdutos,
} from '@/modulos/feirante/servicos/produtosFeirante';
import PopUpExcluir from '@/modulos/feirante/componentes/PopUpExcluir';
import PopUpEditarProduto from './PopUpEditarProduto';
import { EVENTO_XEPAS } from '@/compartilhado/servicos/xepas';
import { formatarMoeda } from '@/compartilhado/servicos/pedidos';
import imagemPadrao from '@/assets/imagens/gerais/xepaCompleta.jpg';
import base from '@/compartilhado/estilos/conta.module.css';
import styles from './estilos/HistoricoProdutos.module.css';

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function HistoricoProdutos() {
  const localizacao = useLocation();
  const [produtos, setProdutos] = useState(carregarProdutos);

  // Feirante logado: as xepas vêm da API (valem em qualquer aparelho).
  useEffect(() => {
    const atualizar = () => setProdutos(carregarProdutos());
    window.addEventListener(EVENTO_XEPAS, atualizar);
    sincronizarProdutos();
    return () => window.removeEventListener(EVENTO_XEPAS, atualizar);
  }, []);
  // A Home pode abrir esta página já com os detalhes de um produto visíveis.
  const [produtoAberto, setProdutoAberto] = useState(
    localizacao.state ? localizacao.state.produtoId : null,
  );
  const [editando, setEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);
  const [erro, setErro] = useState('');

  async function confirmarExclusao() {
    const produto = excluindo;
    setExcluindo(null);
    setErro('');
    try {
      await excluirProduto(produto);
      setProdutos(carregarProdutos());
    } catch (falha) {
      setErro(falha.message);
    }
  }

  return (
    <main className={base.pagina}>
      <header className={base.cabecalho}>
        <div>
          <h1>Histórico de produtos</h1>
          <p>Consulte as Xepas que você já cadastrou.</p>
        </div>
        <Link to="/adicionar-produto" className={base.botaoPrincipal}>
          + Cadastrar Xepa
        </Link>
      </header>

      {erro && (
        <p role="alert" style={{ color: '#c0392b' }}>
          {erro}
        </p>
      )}

      {produtos.length === 0 ? (
        <section className={base.vazio}>
          <Package size={44} aria-hidden="true" />
          <h2>Nenhuma Xepa cadastrada</h2>
          <p>Os produtos que você cadastrar aparecerão aqui.</p>
        </section>
      ) : (
        <>
          

          <div className={styles.grade}>
            {produtos.map((produto) => {
              const aberto = produtoAberto === produto.id;

              return (
                <article className={base.card} key={produto.id}>
                  <img
                    src={produto.imagem || imagemPadrao}
                    alt={produto.nome}
                    className={styles.imagem}
                  />

                  <div className={styles.conteudo}>
                    <span className={base.status}>{produto.categoria}</span>
                    <h2>{produto.nome}</h2>
                    <strong className={styles.preco}>{formatarMoeda(produto.preco)}</strong>
                    <p>
                      Quantidade disponível: {produto.quantidade}
                      {produto.quantidade <= 0 && ' (esgotada)'}
                    </p>
                    <p>
                      Cadastrado em {new Date(produto.cadastradoEm).toLocaleDateString('pt-BR')}
                    </p>

                    {aberto && (
                      <div className={styles.detalhes}>
                        {produto.validade && <p>Validade estimada: {formatarData(produto.validade)}</p>}
                        {produto.itens && <p>O que vem: {produto.itens}</p>}
                        {produto.feira && <p>Feira: {produto.feira}</p>}
                        <p>Local de retirada: {produto.local}</p>
                        <p>{produto.descricao}</p>
                      </div>
                    )}

                    <div className={base.acoes}>
                      <button
                        type="button"
                        className={base.botaoSecundario}
                        aria-expanded={aberto}
                        onClick={() => setProdutoAberto(aberto ? null : produto.id)}
                      >
                        {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
                      </button>
                      <button type="button" className={base.botaoSecundario} onClick={() => setEditando(produto)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className={base.botaoPerigoContorno}
                        onClick={() => setExcluindo(produto)}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {editando && (
        <PopUpEditarProduto
          produto={editando}
          onFechar={() => setEditando(null)}
          onSalvo={() => {
            setEditando(null);
            setProdutos(carregarProdutos());
          }}
        />
      )}

      {excluindo && (
        <PopUpExcluir
          titulo="Excluir xepa?"
          nome={excluindo.nome}
          aviso="sai da vitrine e os clientes não poderão mais comprar. Os pedidos já feitos continuam no histórico."
          onFechar={() => setExcluindo(null)}
          onConfirmar={confirmarExclusao}
        />
      )}
    </main>
  );
}

export default HistoricoProdutos;
