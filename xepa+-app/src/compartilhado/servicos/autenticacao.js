import { enviarJson } from '@/compartilhado/servicos/api';

const CHAVE_SESSAO = 'xepaConta';

export function cadastrarConsumidor(dados) {
  return enviarJson('/auth/cadastro-consumidor', dados);
}

export function cadastrarFeirante(dados) {
  return enviarJson('/auth/cadastro-feirante', dados);
}

export async function entrar(dados) {
  const conta = await enviarJson('/auth/login', dados);
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
  return conta;
}

export function carregarContaDaSessao() {
  return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
}
