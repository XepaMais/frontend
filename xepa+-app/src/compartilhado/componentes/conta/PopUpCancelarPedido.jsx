import { useState } from 'react';
import Modal from '@/compartilhado/componentes/modal/Modal';
import styles from '@/compartilhado/componentes/modal/Modal.module.css';
import { cancelarPedidoNaApi, formatarMoeda } from '@/compartilhado/servicos/pedidos';

// Confirmação para cancelar um pedido da API antes da retirada (consumidor ou feirante).
// A xepa volta para a vitrine e o Pix fica marcado como estornado.
function PopUpCancelarPedido({ pedido, onFechar, onCancelado }) {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    setErro('');
    setEnviando(true);
    try {
      await cancelarPedidoNaApi(pedido);
      onCancelado();
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <Modal titulo={`Cancelar o pedido nº ${pedido.numero}?`} aoFechar={onFechar}>
      <p className={styles.descricao}>
        {pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')} —{' '}
        {formatarMoeda(pedido.total)}. As xepas voltam para a vitrine e o pagamento fica marcado como
        estornado. O reembolso do Pix é combinado pelo chat. Essa ação não pode ser desfeita.
      </p>

      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}

      <div className={styles.acoes}>
        <button type="button" className={styles.secundario} onClick={onFechar}>
          Voltar
        </button>
        <button type="button" className={styles.perigo} onClick={confirmar} disabled={enviando}>
          {enviando ? 'Cancelando...' : 'Cancelar pedido'}
        </button>
      </div>
    </Modal>
  );
}

export default PopUpCancelarPedido;
