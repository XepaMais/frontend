// Card de conversa usado na lista do chat e no quadro de notificações da Home do feirante.
import Styles from '@/modulos/feirante/paginas/historico-chat/estilos/ChatHist.module.css';
import { assuntoDaConversa, mensagensNaoLidas } from '@/compartilhado/servicos/conversas';
import { formatarMoeda } from '@/compartilhado/servicos/pedidos';
import { corDoAvatar, horarioCurto } from '@/modulos/feirante/paginas/historico-chat/componentes/horariosConversa';

export function AvatarConversa({ nome, className = '' }) {
  return (
    <span className={`${Styles.avatarContato} ${corDoAvatar(nome)} ${className}`} aria-hidden="true">
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}

// perfil: quem está vendo ('feirante' ou 'consumidor'). nome: nome do outro lado da conversa.
function ItemConversa({ conversa, perfil, nome, ativo = false, onClick }) {
  const ultima = conversa.mensagens.at(-1);
  const naoLidas = mensagensNaoLidas(conversa, perfil).length;

  return (
    <button
      type="button"
      className={`${Styles.itemContato} ${ativo ? Styles.contatoAtivo : ''} ${naoLidas ? Styles.contatoNaoLido : ''}`}
      onClick={onClick}
      aria-pressed={ativo}
      aria-label={`Conversa com ${nome}, ${assuntoDaConversa(conversa)}`}
    >
      <AvatarConversa nome={nome} />
      <span className={Styles.infoContato}>
        <span className={Styles.linhaContato}>
          <strong className={Styles.nomeContato}>{nome}</strong>
          <time className={Styles.horarioContato}>
            {horarioCurto(ultima?.data || conversa.criadaEm)}
          </time>
        </span>
        <span className={Styles.pedidoContato}>
          {assuntoDaConversa(conversa)}
          {conversa.pedido && ` • ${formatarMoeda(conversa.pedido.total)}`}
        </span>
        <span className={Styles.linhaContato}>
          <span className={Styles.msgContato}>
            {ultima ? ultima.texto : 'Nenhuma mensagem ainda'}
          </span>
          {naoLidas > 0 && (
            <span
              className={Styles.contadorNaoLidas}
              aria-label={`${naoLidas} ${naoLidas === 1 ? 'mensagem nova' : 'mensagens novas'}`}
            >
              {naoLidas}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export default ItemConversa;
