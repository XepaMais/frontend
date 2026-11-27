import { enviarJson } from '@/compartilhado/servicos/api';

const CHAVE_SESSAO = 'xepaConta';

export function cadastrarConsumidor(dados) {
  return enviarJson('/auth/cadastro-consumidor', dados);
}

export function cadastrarFeirante(dados) {
  return enviarJson('/auth/cadastro-feirante', dados);
}

export async function entrar(dados) {
  return guardarConta(await enviarJson('/auth/login', dados));
}

// Demonstração: entra numa conta fictícia da API (perfil: 'consumidor', 'gratis', 'crescer' ou 'pro').
// Os dados ficam na AWS, então a demonstração mostra o mesmo conteúdo em qualquer aparelho.
export async function entrarNaDemo(perfil) {
  return guardarConta(await enviarJson('/auth/demo', { perfil }));
}

function guardarConta(conta) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(conta));
  // Feirante: o login traz o plano salvo na API. Grava na mesma chave de planoFeirante.js,
  // assim em outro aparelho o app não pede para escolher o plano de novo.
  if (conta.tipo === 'FEIRANTE' && conta.plano) {
    localStorage.setItem(`planoFeirante:${conta.id}`, conta.plano);
  }
  return conta;
}

// A demonstração antiga guardava dados fictícios no navegador (localStorage). Agora ela usa contas
// da API; estas chaves ficaram sem uso e mostrariam xepas repetidas e com foto quebrada.
const CHAVES_DEMO_ANTIGA = [
  'produtosFeirante', 'feirasFeirante', 'pedidosXepa', 'conversasXepa', 'lancamentosFinanceiros',
  'gastosFeirante', 'saquesFeirante', 'conversasXepinha:demo', 'perfilFeirante', 'perfilUsuario',
  'carrinhoXepa', 'recebimentoXepa', 'planoFeirante',
];

const CHAVE_DEMO_LIMPA = 'demoAntigaLimpa';

// Roda uma vez por navegador (o carrinho de quem navega sem login usa uma dessas chaves).
export function limparDemoAntiga() {
  try {
    if (localStorage.getItem(CHAVE_DEMO_LIMPA)) return;
    CHAVES_DEMO_ANTIGA.forEach((chave) => localStorage.removeItem(chave));
    localStorage.setItem(CHAVE_DEMO_LIMPA, '1');
  } catch {
    // Navegador sem localStorage (modo privado antigo): não há o que limpar.
  }
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
