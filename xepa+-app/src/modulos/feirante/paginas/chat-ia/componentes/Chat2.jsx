import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MessageCircle, Plus } from 'lucide-react';
import Styles from '@/modulos/feirante/paginas/historico-chat/estilos/ChatHist.module.css';
import Xepinha from '@/modulos/feirante/paginas/chat-ia/estilos/chatIA.module.css';
import BarraPesquisa from '@/compartilhado/componentes/barra-pesquisa/BarraPesquisa';
import TextoXepinha from '@/modulos/feirante/paginas/chat-ia/componentes/TextoXepinha';
import {
  horarioCurto,
  horarioMensagem,
} from '@/modulos/feirante/paginas/historico-chat/componentes/ItemConversa';
import {
  adicionarMensagemXepinha,
  carregarConversasXepinha,
  criarConversaXepinha,
} from '@/modulos/feirante/servicos/conversasXepinha';
import IA from '@/assets/imagens/usuario/ia.png';
import baseConhecimento from '@/modulos/feirante/paginas/chat-ia/xepa-base-conhecimento.md?raw';

// Lê a chave do .env do Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const persona = `## PERSONA E PAPEL
Você é a Xepinha, assistente virtual oficial da plataforma Xepa+.
Você conversa com feirantes assinantes dos planos Broto ou Colheita.
Seu papel é orientá-los de forma prática no uso da plataforma, na gestão do negócio e no combate ao desperdício, com ênfase na gestão financeira.

## TOM DE VOZ
- Amigável, prático, acolhedor e direto.
- Use linguagem simples e acessível, adequada ao dia a dia da feira.
- Mantenha respostas curtas e objetivas.

## ESCOPO DE ATUAÇÃO
1. Navegação no Xepa+: recursos, funcionalidades e erros no aplicativo.
2. Dia a dia da feira: organização da banca, ofertas e combate ao desperdício.
3. Gestão financeira: vendas, compras, receitas, despesas, precificação, taxas e lucro.

## REGRAS E RESTRIÇÕES
- Fonte única: sobre o Xepa+, responda somente com base na BASE DE CONHECIMENTO abaixo. Nunca invente telas, botões, valores ou regras. Se a informação não estiver lá, diga que não sabe e indique o suporte.
- Respostas diretas: responda exatamente ao que foi perguntado, sem sugestões extras.
- Perguntas: só faça uma pergunta quando for indispensável para responder corretamente.
- Fora de escopo: se o assunto não for feira, Xepa+ ou sustentabilidade alimentar, redirecione gentilmente para esses temas.

## FORMATAÇÃO DAS RESPOSTAS
- Texto puro: não use Markdown (sem **negrito**, # títulos, tabelas ou listas com *).
- Passo a passo: para dúvidas sobre o sistema ou finanças, use passos curtos numerados, CADA PASSO EM UMA LINHA SEPARADA:
1. Primeiro passo
2. Segundo passo
- Tópicos sem ordem: cada tópico em uma linha separada, começando com "- ".
- Nunca coloque vários passos ou tópicos na mesma linha.
- Respostas longas: divida em parágrafos curtos de 1 a 3 frases, separados por uma linha em branco.
- Se usar uma frase de introdução antes de uma lista, deixe-a em uma linha própria, antes da lista.`;

const systemInstruction = `${persona}

## BASE DE CONHECIMENTO
${baseConhecimento}`;

// Modelo principal primeiro, reserva depois
const MODELOS = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
const TENTATIVAS_POR_MODELO = 3;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Tenta de novo em 503/429 e, se continuar, usa o modelo reserva.
async function gerarResposta(history, textoUsuario) {
  let ultimoErro;

  for (const nome of MODELOS) {
    const model = genAI.getGenerativeModel({ model: nome, systemInstruction });

    for (let tentativa = 1; tentativa <= TENTATIVAS_POR_MODELO; tentativa++) {
      try {
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(textoUsuario);
        return result.response.text();
      } catch (erro) {
        ultimoErro = erro;
        const temporario = erro?.status === 503 || erro?.status === 429;
        if (!temporario) throw erro; // erro de verdade (chave, requisição): não adianta repetir

        console.warn(`${nome} indisponível (tentativa ${tentativa}/${TENTATIVAS_POR_MODELO})`);
        if (tentativa < TENTATIVAS_POR_MODELO) {
          await esperar(1000 * 2 ** (tentativa - 1)); // espera 1s, depois 2s
        }
      }
    }
  }

  throw ultimoErro;
}


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

  function recarregar() {
    setConversas(carregarConversasXepinha());
  }

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

    // O histórico do Gemini começa pelo usuário: a saudação fica de fora.
    const history = mensagens.map((msg) => ({
      role: msg.remetente === 'user' ? 'user' : 'model',
      parts: [{ text: msg.texto }],
    }));

    const id = conversa?.id || criarConversaXepinha(textoUsuario);
    adicionarMensagemXepinha(id, 'user', textoUsuario);
    setConversaAtiva(id);
    setInputTexto('');
    setAguardando(id);
    recarregar();

    let resposta;
    try {
      resposta = await gerarResposta(history, textoUsuario);
    } catch (error) {
      console.error('Erro na API do Gemini:', error);

      const sobrecarga = error?.status === 503 || error?.status === 429;
      resposta = sobrecarga
        ? 'Estou com muitas conversas agora. Tente de novo em alguns segundos.'
        : 'Ops! Tive um problema ao processar sua resposta. Tente novamente em instantes.';
    }

    adicionarMensagemXepinha(id, 'ia', resposta);
    setAguardando(null);
    recarregar();
  };

  return (
    <main className={Styles.paginaChat}>
      <header className={Styles.cabecalhoPagina}>
        <h1>Xepinha</h1>
        <p>Tire suas dúvidas sobre o Xepa+, a feira e a gestão financeira.</p>
      </header>

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
