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
  // Feirante: o login traz o plano salvo na API. Grava na mesma chave de planoFeirante.js,
  // assim em outro aparelho o app não pede para escolher o plano de novo.
  if (conta.tipo === 'FEIRANTE' && conta.plano) {
    localStorage.setItem(`planoFeirante:${conta.id}`, conta.plano);
  }
  return conta;
}

// "Sair" e a demonstração: a conta deixa de estar logada neste navegador.
// Conta logada: o login deste aparelho também é encerrado na API (sai de "Dispositivos conectados").
export function encerrarSessao() {
  const conta = carregarContaDaSessao();
  sessionStorage.removeItem(CHAVE_SESSAO);

  if (conta?.token) {
    const base = import.meta.env.VITE_API_URL || '/api';
    // keepalive: o pedido termina mesmo se a página mudar logo em seguida.
    fetch(`${base}/conta/${conta.id}/sair`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${conta.token}` },
      keepalive: true,
    }).catch(() => {
      // Sem conexão: o login deste aparelho vence sozinho em 30 dias.
    });
  }
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
