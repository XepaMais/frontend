import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import iconlixeira from '../../../../../assets/imagens/gerais/iconlixeira.png';
import vector from '../../../../../assets/imagens/gerais/vector.png';
import imagemPadrao from '@/assets/imagens/gerais/xepaCompleta.jpg';
import { ENTREGA_CASA, formatarMoeda } from '@/compartilhado/servicos/pedidos';
import base from '@/compartilhado/estilos/conta.module.css';
import useCarrinho from '@/modulos/usuario/hooks/useCarrinho';
import {
  alterarQuantidade,
  calcularTotal,
  carregarRecebimento,
  enderecoCompleto,
  removerDoCarrinho,
  salvarRecebimento,
} from '@/modulos/usuario/servicos/carrinho';
import { calcularFrete, chaveFrete } from '@/modulos/usuario/servicos/frete';
import Styles from '../estilos/carrinho.module.css';
import EscolhaRecebimento from './EscolhaRecebimento';

export function Carrinho() {
  const navegar = useNavigate();
  const { itens } = useCarrinho();
  const [recebimento, setRecebimento] = useState(carregarRecebimento);
  const [mostrarErros, setMostrarErros] = useState(false);
  const entrega = recebimento.tipo === ENTREGA_CASA;
  const enderecoOk = enderecoCompleto(recebimento.endereco);

  // O frete só vale se foi calculado para este carrinho e este endereço.
  const frete = entrega && enderecoOk
    && recebimento.frete?.chave === chaveFrete(itens, recebimento.endereco)
    ? recebimento.frete
    : null;
  const calculandoFrete = entrega && enderecoOk && !frete && itens.length > 0;
  const subtotal = calcularTotal(itens);
  const total = subtotal + (frete ? frete.valor : 0);

  // Calcula o frete um pouco depois que a pessoa para de digitar o endereço.
  useEffect(() => {
    if (!calculandoFrete) return undefined;

    let cancelado = false;
    const espera = setTimeout(async () => {
      const novoFrete = await calcularFrete(itens, recebimento.endereco);

      if (!cancelado) {
        setRecebimento((atual) => {
          const atualizado = { ...atual, frete: novoFrete };
          salvarRecebimento(atualizado);
          return atualizado;
        });
      }
    }, 700);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [calculandoFrete, itens, recebimento.endereco]);

  function alterarRecebimento(novoRecebimento) {
    setRecebimento(novoRecebimento);
    salvarRecebimento(novoRecebimento);
  }

  // Entrega em casa só segue para o pagamento com o endereço preenchido.
  function irParaPagamento() {
    if (entrega && !enderecoOk) {
      setMostrarErros(true);
      return;
    }

    if (entrega && (!frete || frete.foraDoRaio)) return;

    navegar('/pagamento');
  }

  // Texto da linha de frete no resumo.
  function textoFrete() {
    if (!entrega) return 'Grátis';
    if (!enderecoOk) return 'Informe o endereço';
    if (calculandoFrete) return 'Calculando...';
    if (frete.foraDoRaio) return 'Indisponível';
    return formatarMoeda(frete.valor);
  }

  return (
    <div className={Styles.container}>
      <main className={Styles.main_content}>
        <h1>Meu carrinho</h1>

        {itens.length === 0 ? (
          <section className={base.vazio}>
            <ShoppingCart size={44} aria-hidden="true" />
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione xepas para retirar na feira ou receber em casa.</p>
            <Link to="/homeU" className={base.botaoPrincipal}>
              Ver xepas
            </Link>
          </section>
        ) : (
          <div className={Styles.carrinho_grid}>
            <section className={Styles.tabela_produtos}>
              <div className={Styles.tabela_header}>
                <h4>Produtos</h4>
                <h4>Feira</h4>
                <h4>Total</h4>
                <h4>Ação</h4>
              </div>

              {itens.map((item) => (
                <div className={Styles.tabela_linha} key={item.id}>
                  <div className={Styles.coluna_produto}>
                    <img src={item.imagem || imagemPadrao} alt="" />
                    <div>
                      <h4>
                        <Link to={`/Verduras?xepa=${item.id}`}>{item.nome}</Link>
                      </h4>
                      <div className={Styles.quantidade}>
                        <button
                          type="button"
                          aria-label={`Diminuir quantidade de ${item.nome}`}
                          disabled={item.quantidade <= 1}
                          onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                        >
                          <Minus size={16} aria-hidden="true" />
                        </button>
                        <span aria-live="polite">{item.quantidade}</span>
                        <button
                          type="button"
                          aria-label={`Aumentar quantidade de ${item.nome}`}
                          disabled={item.quantidade >= item.disponivel}
                          onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                        >
                          <Plus size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={Styles.coluna_retirada}>
                    <h4>{item.feira || 'Local de retirada'}</h4>
                    <p>{item.local}</p>
                  </div>

                  <div className={Styles.coluna_total}>
                    <h4>{formatarMoeda(item.preco * item.quantidade)}</h4>
                  </div>

                  <div className={Styles.coluna_acao}>
                    <button
                      type="button"
                      aria-label={`Remover ${item.nome}`}
                      onClick={() => removerDoCarrinho(item.id)}
                    >
                      <img src={iconlixeira} alt="" />
                    </button>
                  </div>
                </div>
              ))}
            </section>

            <aside className={Styles.resumo_card}>
              <h4>Resumo do pedido</h4>

              <hr />

              <div className={Styles.resumo_itens}>
                {itens.map((item) => (
                  <div className={Styles.resumo_linha} key={item.id}>
                    <h4>
                      {item.quantidade}x {item.nome}
                    </h4>
                    <p>{formatarMoeda(item.preco * item.quantidade)}</p>
                  </div>
                ))}

                <div className={Styles.resumo_linha}>
                  <h4>{entrega ? 'Taxa de entrega' : 'Retirada na feira'}</h4>
                  <p>{textoFrete()}</p>
                </div>
              </div>

              <hr />

              <div className={Styles.resumo_total}>
                <h4>Total</h4>
                <h4>{formatarMoeda(total)}</h4>
              </div>

              <hr />

              <EscolhaRecebimento
                itens={itens}
                recebimento={recebimento}
                onChange={alterarRecebimento}
                mostrarErros={mostrarErros && !enderecoOk}
                frete={frete}
                calculandoFrete={calculandoFrete}
              />

              <div className={Styles.alerta_endereco}>
                <img src={vector} alt="" />
                <p>
                  {entrega
                    ? 'Confira o endereço de entrega e mostre o código do pedido ao receber.'
                    : 'Reveja o endereço das barracas e lembre-se de mostrar o QRCode para retirada do produto.'}
                </p>
              </div>

              <button
                type="button"
                className={Styles.btn_pagar}
                onClick={irParaPagamento}
                disabled={entrega && (calculandoFrete || Boolean(frete?.foraDoRaio))}
              >
                <h3>Pagar</h3>
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
