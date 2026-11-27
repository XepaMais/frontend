// Conversas com a Xepinha.
// - Feirante logado: a pergunta vai para a API (/api/feirante/{idConta}/xepinha), que chama a IA
//   pelo servidor — a chave do Gemini não fica no navegador. As conversas ficam no banco e valem em
//   qualquer aparelho; uma cópia fica aqui para mostrar na hora.
// - Modo demonstração: usa /api/xepinha/demo (sem salvar nada na API) e guarda as conversas neste navegador.
import { idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';
import { enviarJson, requisicaoApi } from '@/compartilhado/servicos/api';

const CHAVE = 'conversasXepinha';

export const EVENTO_XEPINHA = 'xepinha-atualizada';

const ERRO_PADRAO = 'Ops! Tive um problema ao processar sua resposta. Tente novamente em instantes.';

function logado() {
  return idFeiranteAtual() !== 'demo';
}

function chaveDaConta() {
  return logado() ? `${CHAVE}Api:${idFeiranteAtual()}` : `${CHAVE}:demo`;
}

function ultimaAtividade(conversa) {
  return conversa.mensagens.at(-1)?.data || conversa.criadaEm;
}

// As mais recentes primeiro.
export function carregarConversasXepinha() {
  const conversas = JSON.parse(localStorage.getItem(chaveDaConta())) || [];

  return conversas.sort((a, b) => new Date(ultimaAtividade(b)) - new Date(ultimaAtividade(a)));
}

function salvar(conversas) {
  localStorage.setItem(chaveDaConta(), JSON.stringify(conversas));
  window.dispatchEvent(new Event(EVENTO_XEPINHA));
}

// O título é o começo da primeira pergunta do feirante.
function tituloDa(texto) {
  return texto.length > 40 ? `${texto.slice(0, 40).trimEnd()}...` : texto;
}

function novaMensagem(remetente, texto, extras = {}) {
  return { id: `${Date.now()}-${Math.random()}`, remetente, texto, data: new Date().toISOString(), ...extras };
}

// Coloca a pergunta na tela na hora (antes da resposta chegar).
function adicionarPergunta(idConversa, texto) {
  const conversas = carregarConversasXepinha();
  const pergunta = novaMensagem('user', texto, { pendente: true });

  if (idConversa && conversas.some((conversa) => conversa.id === idConversa)) {
    salvar(conversas.map((conversa) => (
      conversa.id === idConversa ? { ...conversa, mensagens: [...conversa.mensagens, pergunta] } : conversa
    )));
    return idConversa;
  }

  const id = `nova-${Date.now()}`;
  salvar([{ id, titulo: tituloDa(texto), criadaEm: new Date().toISOString(), mensagens: [pergunta] }, ...conversas]);
  return id;
}

function trocarConversa(idAntigo, conversaNova) {
  const outras = carregarConversasXepinha().filter((conversa) => conversa.id !== idAntigo && conversa.id !== conversaNova.id);
  salvar([conversaNova, ...outras]);
}

function adicionarResposta(idConversa, texto, extras = {}) {
  salvar(carregarConversasXepinha().map((conversa) => (
    conversa.id === idConversa
      ? {
        ...conversa,
        mensagens: [
          ...conversa.mensagens.map((mensagem) => ({ ...mensagem, pendente: false })),
          novaMensagem('ia', texto, extras),
        ],
      }
      : conversa
  )));
}

// Feirante logado: traz as conversas salvas na API.
export async function sincronizarConversasXepinha() {
  if (!logado()) return;

  try {
    const conversas = await requisicaoApi(`/feirante/${idFeiranteAtual()}/xepinha/conversas`);
    salvar(conversas);
  } catch {
    // Sem conexão (ou plano sem Xepinha): fica com a cópia deste navegador.
  }
}

// Envia a pergunta. Devolve { id, resposta }: "id" é a conversa já na tela (a pergunta aparece na hora)
// e "resposta" é uma Promise com o id definitivo da conversa quando a Xepinha responder.
export function perguntarXepinha(idConversa, texto) {
  const id = adicionarPergunta(idConversa, texto);

  if (logado()) {
    const resposta = enviarJson(`/feirante/${idFeiranteAtual()}/xepinha/mensagens`, {
      idConversa: typeof idConversa === 'number' ? idConversa : null,
      texto,
    })
      .then((conversa) => {
        trocarConversa(id, conversa);
        return conversa.id;
      })
      .catch((falha) => {
        // A API não salvou nada: a resposta de erro fica só na tela até a próxima atualização.
        adicionarResposta(id, falha.message || ERRO_PADRAO, { temporaria: true });
        return id;
      });
    return { id, resposta };
  }

  // Modo demonstração: manda o histórico junto (a API não guarda nada).
  const historico = (carregarConversasXepinha().find((conversa) => conversa.id === id)?.mensagens || [])
    .filter((mensagem) => !mensagem.pendente && !mensagem.temporaria)
    .map(({ remetente, texto: conteudo }) => ({ remetente, texto: conteudo }));

  const resposta = enviarJson('/xepinha/demo', { historico, texto })
    .then(({ resposta: textoResposta }) => {
      adicionarResposta(id, textoResposta);
      return id;
    })
    .catch((falha) => {
      adicionarResposta(id, falha.message || ERRO_PADRAO, { temporaria: true });
      return id;
    });
  return { id, resposta };
}
