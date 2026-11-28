import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ClipboardList, Home, QrCode, Store } from 'lucide-react';
import {
  carregarPedidos,
  descreverRecebimento,
  ENTREGA_CASA,
  formaRecebimento,
  formatarDataHora,
  formatarMoeda,
  RETIRADO,
  textoStatus,
  textoTaxaEntrega,
} from '@/compartilhado/servicos/pedidos';
import { abrirConversaDoPedido } from '@/compartilhado/servicos/conversas';
import base from '@/compartilhado/estilos/conta.module.css';
import styles from './estilos/HistoricoPedidos.module.css';

function HistoricoPedidos() {
  const [pedidos] = useState(carregarPedidos);
  const [pedidoAberto, setPedidoAberto] = useState(null);
  const navegar = useNavigate();

  function falarComVendedor(pedido) {
    const conversa = abrirConversaDoPedido(pedido);
    navegar('/HistoricoChatUsuario', { state: { conversa } });
  }

  return (
    <main className={base.pagina}>
      <header className={base.cabecalho}>
        <div>
          <h1>Meus pedidos</h1>
          <p>Histórico das suas compras no Xepa+.</p>
        </div>
      </header>

      {pedidos.length === 0 ? (
        <section className={base.vazio}>
          <ClipboardList size={44} aria-hidden="true" />
          <h2>Você ainda não tem pedidos</h2>
          <p>Quando você confirmar um pagamento, o pedido aparecerá aqui.</p>
          <Link to="/carrinho" className={base.botaoPrincipal}>
            Ir para o carrinho
          </Link>
        </section>
      ) : (
        <>

          <div className={base.lista}>
            {pedidos.map((pedido) => {
              const aberto = pedidoAberto === pedido.numero;
              const entrega = formaRecebimento(pedido) === ENTREGA_CASA;
              const recebimento = descreverRecebimento(pedido);

              return (
                <article className={base.card} key={pedido.numero}>
                  <header className={base.faixa}>
                    <strong>Pedido nº {pedido.numero}</strong>
                    <span>Comprado em {formatarDataHora(pedido.data)}</span>
                  </header>

                  <div className={base.corpo}>
                    <ul className={styles.itens}>
                      {pedido.itens.map((item) => (
                        <li className={styles.item} key={item.nome}>
                          <img src={item.imagem} alt="" className={styles.imagem} />
                          <div className={styles.itemTexto}>
                            <strong>{item.nome}</strong>
                            <span>{item.barraca}</span>
                            {aberto && (
                              <>
                                <span>{item.descricao}</span>
                                {!entrega && <span>Retirada: {item.retirada}</span>}
                                <span>Quantidade: {item.quantidade}</span>
                              </>
                            )}
                          </div>
                          <span className={styles.preco}>
                            {formatarMoeda(item.preco * item.quantidade)}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Forma de recebimento escolhida na compra */}
                    <div className={styles.recebimento}>
                      {entrega ? (
                        <Home size={22} aria-hidden="true" />
                      ) : (
                        <Store size={22} aria-hidden="true" />
                      )}
                      <div>
                        <strong>{recebimento.titulo}</strong>
                        {recebimento.detalhe && <span>{recebimento.detalhe}</span>}
                        {recebimento.taxa != null && <span>{textoTaxaEntrega(recebimento)}</span>}
                      </div>
                    </div>

                    {/* Código para mostrar ao feirante na hora de retirar ou receber */}
                    {pedido.codigo && pedido.status !== RETIRADO && (
                      <div className={styles.retirada}>
                        <QrCode size={88} aria-hidden="true" className={styles.qrCode} />
                        <div>
                          <span>{entrega ? 'Código de entrega' : 'Código de retirada'}</span>
                          <strong className={styles.codigo}>{pedido.codigo}</strong>
                          <p>
                            {entrega
                              ? 'Mostre este código ou o QR Code a quem entregar o pedido.'
                              : 'Mostre este código ou o QR Code ao feirante para retirar o pedido.'}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className={styles.rodape}>
                      <div className={styles.resumo}>
                        <span className={base.status}>{textoStatus(pedido)}</span>
                        <strong>Total: {formatarMoeda(pedido.total)}</strong>
                      </div>

                      <div className={base.acoes}>
                        <button
                          type="button"
                          className={base.botaoSecundario}
                          aria-expanded={aberto}
                          onClick={() => setPedidoAberto(aberto ? null : pedido.numero)}
                        >
                          {aberto ? 'Ocultar detalhes' : 'Ver detalhes'}
                        </button>
                        <button
                          type="button"
                          className={base.botaoPrincipal}
                          onClick={() => falarComVendedor(pedido)}
                        >
                          Falar com vendedor
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}

export default HistoricoPedidos;
