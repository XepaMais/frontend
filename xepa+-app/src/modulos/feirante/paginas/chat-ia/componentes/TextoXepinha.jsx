import Xepinha from '@/modulos/feirante/paginas/chat-ia/estilos/chatIA.module.css';
import { formatarResposta } from './formatarResposta';

// Resposta da Xepinha com parágrafos, passos numerados e tópicos, cada um em sua linha.
function TextoXepinha({ texto }) {
  const blocos = formatarResposta(texto);

  return (
    <div className={Xepinha.resposta}>
      {blocos.map((bloco, indice) => {
        if (bloco.tipo === 'paragrafo') return <p key={indice}>{bloco.texto}</p>;

        const Lista = bloco.tipo === 'numerada' ? 'ol' : 'ul';

        return (
          <Lista key={indice} start={bloco.tipo === 'numerada' ? bloco.inicio : undefined}>
            {bloco.itens.map((item, posicao) => (
              <li key={posicao}>{item}</li>
            ))}
          </Lista>
        );
      })}
    </div>
  );
}

export default TextoXepinha;
