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

// "Sair" e a demonstração: a conta deixa de estar logada neste navegador.
export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE_SESSAO);
}

export function carregarContaDaSessao() {
  return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null');
}

// Dono dos dados do feirante no navegador: id da conta logada, ou 'demo'.
export function idFeiranteAtual() {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'FEIRANTE' ? String(conta.id) : 'demo';
}

// Dados salvos antes desta separação não têm dono: ficam só no modo demonstração.
export function ehDoFeiranteAtual(item) {
  return String(item?.idFeirante ?? 'demo') === idFeiranteAtual();
}
