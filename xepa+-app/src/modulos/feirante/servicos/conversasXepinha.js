// Conversas com a Xepinha, por conta, neste navegador.
import { idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

const CHAVE = 'conversasXepinha';

function chaveDaConta() {
  return `${CHAVE}:${idFeiranteAtual()}`;
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
}

// O título é o começo da primeira pergunta do feirante.
function tituloDa(texto) {
  return texto.length > 40 ? `${texto.slice(0, 40).trimEnd()}...` : texto;
}

export function criarConversaXepinha(primeiraPergunta) {
  const conversa = {
    id: `xepinha-${Date.now()}`,
    titulo: tituloDa(primeiraPergunta),
    criadaEm: new Date().toISOString(),
    mensagens: [],
  };

  salvar([conversa, ...carregarConversasXepinha()]);
  return conversa.id;
}

// remetente: 'user' (feirante) ou 'ia' (Xepinha).
export function adicionarMensagemXepinha(id, remetente, texto) {
  const mensagem = { id: Date.now() + Math.random(), remetente, texto, data: new Date().toISOString() };

  salvar(carregarConversasXepinha().map((conversa) => (
    conversa.id === id ? { ...conversa, mensagens: [...conversa.mensagens, mensagem] } : conversa
  )));
}

