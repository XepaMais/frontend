import { useState } from 'react';
import Modal from '@/compartilhado/componentes/modal/Modal';
import styles from '@/compartilhado/componentes/modal/Modal.module.css';
import { confirmarEntregaDoPedido, sincronizarConversas } from '@/compartilhado/servicos/conversas';
import {
  confirmarRetiradaNaApi,
  descreverRecebimento,
  ENTREGA_CASA,
  formaRecebimento,
  formatarMoeda,
} from '@/compartilhado/servicos/pedidos';

// Confirmação usada na Home do feirante e no Histórico de vendas.
// O feirante digita o código que o cliente mostra; pedidos antigos sem código só pedem confirmação.
// Pedidos da API: quem confere o código é a API (o feirante não recebe o código).
function PopUpConfirmarEntrega({ pedido, onFechar, onConfirmado }) {
  const [codigo, setCodigo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const entrega = formaRecebimento(pedido) === ENTREGA_CASA;
  const recebimento = descreverRecebimento(pedido);
  const daApi = pedido.origem === 'api';
  const precisaCodigo = daApi || Boolean(pedido.codigo);

  async function confirmar(evento) {
    evento.preventDefault();

    if (daApi) {
      setEnviando(true);
      try {
        await confirmarRetiradaNaApi(pedido, codigo.trim());
      } catch (falha) {
        setErro(falha.message === 'Código de retirada incorreto.'
          ? 'Código incorreto. Confira o código que aparece no pedido do cliente.'
          : falha.message);
        setEnviando(false);
        return;
      }
      // A conversa do pedido também foi finalizada pela API.
      sincronizarConversas();
      onConfirmado();
      return;
    }

    if (precisaCodigo && codigo.trim() !== String(pedido.codigo)) {
      setErro('Código incorreto. Confira o código que aparece no pedido do cliente.');
      return;
    }

    confirmarEntregaDoPedido(pedido.numero);
    onConfirmado();
  }

  return (
    <Modal
      titulo={entrega ? 'Confirmar entrega' : 'Confirmar retirada'}
      descricao={
        precisaCodigo
          ? `Peça ao cliente o código do pedido nº ${pedido.numero} e digite abaixo.`
          : `Confirme que o cliente recebeu o pedido nº ${pedido.numero}.`
      }
      aoFechar={onFechar}
    >
      <form className={styles.form} onSubmit={confirmar} noValidate>
        <div className={styles.resumo}>
          <span>
            {pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}
          </span>
          <span>
            <strong>Total:</strong> {formatarMoeda(pedido.total)}
          </span>
          <span>
            <strong>{recebimento.titulo}</strong>
            {recebimento.detalhe && `: ${recebimento.detalhe}`}
          </span>
        </div>

        {precisaCodigo && (
          <div className={styles.campo}>
            <label htmlFor="codigoEntrega">Código do cliente</label>
            <input
              id="codigoEntrega"
              value={codigo}
              onChange={(evento) => {
                setCodigo(evento.target.value.replace(/\D/g, '').slice(0, 4));
                setErro('');
              }}
              inputMode="numeric"
              autoComplete="off"
              placeholder="0000"
              autoFocus
            />
          </div>
        )}

        {erro && (
          <p className={styles.erro} role="alert">
            {erro}
          </p>
        )}

        <div className={styles.acoes}>
          <button type="button" className={styles.secundario} onClick={onFechar}>
            Cancelar
          </button>
          <button
            type="submit"
            className={styles.principal}
            disabled={enviando || (precisaCodigo && codigo.length < 4)}
          >
            {entrega ? 'Confirmar entrega' : 'Confirmar retirada'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PopUpConfirmarEntrega;
