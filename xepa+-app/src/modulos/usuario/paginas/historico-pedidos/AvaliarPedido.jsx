import { useState } from 'react';
import { Star } from 'lucide-react';
import base from '@/compartilhado/estilos/conta.module.css';
import { avaliarPedido } from '@/compartilhado/servicos/pedidos';
import styles from './estilos/AvaliarPedido.module.css';

const NOTAS = [1, 2, 3, 4, 5];
const TEXTOS = { 1: 'Ruim', 2: 'Regular', 3: 'Bom', 4: 'Muito bom', 5: 'Excelente' };

export function Estrelas({ nota, tamanho = 18 }) {
  return (
    <span className={styles.estrelas} role="img" aria-label={`${nota} de 5 estrelas`}>
      {NOTAS.map((valor) => (
        <Star key={valor} size={tamanho} aria-hidden="true" className={valor <= nota ? styles.cheia : styles.vazia} />
      ))}
    </span>
  );
}

// Avaliação do pedido já retirado/entregue (pedidos da API). A nota vai para a média do feirante.
function AvaliarPedido({ pedido }) {
  const [editando, setEditando] = useState(!pedido.avaliacao);
  const [nota, setNota] = useState(pedido.avaliacao?.nota || 0);
  const [comentario, setComentario] = useState(pedido.avaliacao?.comentario || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  async function salvar(evento) {
    evento.preventDefault();
    if (!nota) {
      setErro('Escolha de 1 a 5 estrelas.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      await avaliarPedido(pedido, nota, comentario.trim());
      setEditando(false);
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setSalvando(false);
    }
  }

  if (!editando && pedido.avaliacao) {
    return (
      <div className={styles.caixa}>
        <span>Sua avaliação</span>
        <Estrelas nota={pedido.avaliacao.nota} />
        {pedido.avaliacao.comentario && <p className={styles.comentario}>“{pedido.avaliacao.comentario}”</p>}
        <button type="button" className={base.botaoSecundario} onClick={() => setEditando(true)}>
          Alterar avaliação
        </button>
      </div>
    );
  }

  return (
    <form className={styles.caixa} onSubmit={salvar}>
      <span>Como foi sua xepa?</span>
      <div className={styles.escolha} role="radiogroup" aria-label="Nota do pedido">
        {NOTAS.map((valor) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={nota === valor}
            aria-label={`${valor} estrela${valor > 1 ? 's' : ''}: ${TEXTOS[valor]}`}
            className={styles.botaoEstrela}
            onClick={() => setNota(valor)}
          >
            <Star size={26} aria-hidden="true" className={valor <= nota ? styles.cheia : styles.vazia} />
          </button>
        ))}
        {nota > 0 && <small>{TEXTOS[nota]}</small>}
      </div>
      <textarea
        className={styles.texto}
        value={comentario}
        onChange={(evento) => setComentario(evento.target.value)}
        maxLength={500}
        rows={2}
        placeholder="Conte como foi (opcional)"
        aria-label="Comentário sobre o pedido"
      />
      {erro && (
        <p className={styles.erro} role="alert">
          {erro}
        </p>
      )}
      <button type="submit" className={base.botaoPrincipal} disabled={salvando}>
        {salvando ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}

export default AvaliarPedido;
