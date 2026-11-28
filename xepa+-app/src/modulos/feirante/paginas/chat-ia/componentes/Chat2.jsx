import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import Styles from '@/modulos/feirante/paginas/historico-chat/estilos/ChatHist.module.css';
import Xepinha from '@/modulos/feirante/paginas/chat-ia/estilos/chatIA.module.css';
import BarraPesquisa from '@/compartilhado/componentes/barra-pesquisa/BarraPesquisa';
import TextoXepinha from '@/modulos/feirante/paginas/chat-ia/componentes/TextoXepinha';
import {
  horarioCurto,
  horarioMensagem,
} from '@/modulos/feirante/paginas/historico-chat/componentes/horariosConversa';
import {
  carregarConversasXepinha,
  EVENTO_XEPINHA,
  perguntarXepinha,
  sincronizarConversasXepinha,
} from '@/modulos/feirante/servicos/conversasXepinha';
import IA from '@/assets/imagens/usuario/ia.png';

// A persona, a base de conhecimento e a chave do Gemini ficam no backend
// (resources/xepinha e GEMINI_API_KEY): o navegador só manda a pergunta.

const SAUDACAO = 'Olá! Eu sou a Xepinha, sua assistente no Xepa+. Como posso te ajudar hoje?';

// Mesmo visual da página de Conversas.
// Sem conversa aberta, a direita é uma conversa nova.
function Chat2() {
  const [conversas, setConversas] = useState(carregarConversasXepinha);
  const [conversaAtiva, setConversaAtiva] = useState(() => carregarConversasXepinha()[0]?.id || null);
  const [busca, setBusca] = useState('');
  const [inputTexto, setInputTexto] = useState('');
  // Conversa esperando resposta: a Xepinha responde mesmo se o feirante trocar de conversa.
  const [aguardando, setAguardando] = useState(null);
  const [mobileConversaAberta, setMobileConversaAberta] = useState(false);
  const areaMensagensRef = useRef(null);

  const conversa = conversas.find(({ id }) => id === conversaAtiva) || null;
  const mensagens = conversa?.mensagens || [];
  const carregando = aguardando !== null && aguardando === conversaAtiva;

  const termo = busca.trim().toLowerCase();
  const conversasFiltradas = conversas.filter((item) => (
    `${item.titulo} ${item.mensagens.map(({ texto }) => texto).join(' ')}`.toLowerCase().includes(termo)
  ));

  // Rola só a caixa de mensagens até a última mensagem (não a página).
  useEffect(() => {
    const area = areaMensagensRef.current;
    if (area) area.scrollTop = area.scrollHeight;
  }, [conversaAtiva, mensagens.length, carregando]);

  // Feirante logado: traz da API as conversas (feitas em qualquer aparelho).
  useEffect(() => {
    const atualizar = () => setConversas(carregarConversasXepinha());
    window.addEventListener(EVENTO_XEPINHA, atualizar);
    sincronizarConversasXepinha();
    return () => window.removeEventListener(EVENTO_XEPINHA, atualizar);
  }, []);

  function abrirConversa(id) {
    setConversaAtiva(id);
    setMobileConversaAberta(true);
  }

  function novaConversa() {
    setConversaAtiva(null);
    setInputTexto('');
    setMobileConversaAberta(true);
  }

  const handleEnviarMensagem = async (e) => {
    e.preventDefault();
    const textoUsuario = inputTexto.trim();
    if (!textoUsuario || aguardando) return;

    // A pergunta aparece na hora; a resposta chega pela API (erros viram uma mensagem da Xepinha).
    const { id, resposta } = perguntarXepinha(conversa?.id ?? null, textoUsuario);
    setConversaAtiva(id);
    setInputTexto('');
    setAguardando(id);

    const idFinal = await resposta;
    // Conversa nova ganha o id definitivo da API: continua aberta se o feirante não trocou de conversa.
    setConversaAtiva((atual) => (atual === id ? idFinal : atual));
    setAguardando(null);
  };

  return (
    <main className={Styles.paginaChat}>
      <section
        className={`${Styles.quadroChat} ${mobileConversaAberta ? Styles.conversaMobileAtiva : ''}`}
        aria-label="Conversas com a Xepinha"
      >
        <aside className={Styles.barraLateral} aria-label="Histórico de conversas">
          <div className={Styles.abas}>
            <span className={`${Styles.aba} ${Styles.abaAtiva}`}>
              Histórico
              <span className={Styles.contadorAba}>{conversas.length}</span>
            </span>
            <button
              type="button"
              className={Styles.aba}
              onClick={novaConversa}
              aria-label="Nova conversa"
            >
              <Plus size={16} aria-hidden="true" />
              Nova
            </button>
          </div>

          <BarraPesquisa
            className={Styles.containerBusca}
            valor={busca}
            aoMudar={setBusca}
            placeholder="Buscar no histórico..."
            rotulo="Buscar nas conversas com a Xepinha"
          />

          <div className={Styles.listaContatos}>
            {conversasFiltradas.map((item) => {
              const ultima = item.mensagens.at(-1);
              const ativo = item.id === conversaAtiva;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${Styles.itemContato} ${ativo ? Styles.contatoAtivo : ''}`}
                  onClick={() => abrirConversa(item.id)}
                  aria-pressed={ativo}
                >
                  <img src={IA} alt="" className={`${Styles.avatarContato} ${Xepinha.avatarImagem}`} />
                  <span className={Styles.infoContato}>
                    <span className={Styles.linhaContato}>
                      <strong className={Styles.nomeContato}>{item.titulo}</strong>
                      <time className={Styles.horarioContato}>
                        {horarioCurto(ultima?.data || item.criadaEm)}
                      </time>
                    </span>
                    <span className={Styles.linhaContato}>
                      <span className={Styles.msgContato}>
                        {item.id === aguardando ? 'Xepinha está digitando...' : ultima?.texto}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}

            {conversas.length > 0 && conversasFiltradas.length === 0 && (
              <p className={Styles.semContatos}>Nenhuma conversa encontrada.</p>
            )}

            {conversas.length === 0 && (
              <div className={Styles.listaVazia}>
                <span className={Styles.iconeVazio} aria-hidden="true">
                  <MessageCircle />
                </span>
                <strong>Você ainda não conversou com a Xepinha</strong>
                <p>Faça uma pergunta e a conversa ficará salva nesta lista.</p>
              </div>
            )}
          </div>
        </aside>

        <section className={Styles.areaConversa} aria-label="Conversa com a Xepinha">
          <header className={Styles.cabecalhoConversa}>
            <button
              className={Styles.botaoVoltar}
              type="button"
              onClick={() => setMobileConversaAberta(false)}
              aria-label="Voltar para o histórico"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <img
              src={IA}
              alt="Foto de perfil da Xepinha"
              className={`${Styles.avatarContato} ${Styles.avatarAtivo} ${Xepinha.avatarImagem}`}
            />
            <div className={Styles.tituloConversa}>
              <h2 className={Styles.nomeAtivo}>Xepinha</h2>
              <span>{conversa ? conversa.titulo : 'Nova conversa'}</span>
            </div>
          </header>

          <div className={Styles.areaMensagens} aria-live="polite" ref={areaMensagensRef}>
            <div className={Styles.linhaMensagem}>
              <div className={Styles.balao}>
                <span>{SAUDACAO}</span>
              </div>
            </div>

            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`${Styles.linhaMensagem} ${msg.remetente === 'user' ? Styles.mensagemMinha : ''}`}
              >
                <div className={`${Styles.balao} ${Xepinha.textoLivre}`}>
                  {msg.remetente === 'ia' ? <TextoXepinha texto={msg.texto} /> : <span>{msg.texto}</span>}
                  <time>{horarioMensagem(msg.data)}</time>
                </div>
              </div>
            ))}

            {carregando && (
              <div className={Styles.linhaMensagem}>
                <div className={Styles.balao}>
                  <span>Xepinha está digitando...</span>
                </div>
              </div>
            )}
          </div>

          <form className={Styles.areaInput} onSubmit={handleEnviarMensagem}>
            <input
              aria-label="Escreva uma mensagem para a Xepinha"
              type="text"
              placeholder="Digite sua mensagem..."
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              disabled={Boolean(aguardando)}
            />
            <button
              type="submit"
              className={Styles.btnEnviar}
              disabled={Boolean(aguardando) || !inputTexto.trim()}
              aria-label="Enviar mensagem"
            >
              ↗
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Chat2;
