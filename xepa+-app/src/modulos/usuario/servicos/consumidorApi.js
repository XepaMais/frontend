// Conexões da área do consumidor com a API (backend Spring: /api/xepas e /api/consumidor/{idConta}).
// {idConta} é o "id" que o login devolve (conta do tipo CONSUMIDOR).
import { enviarJson, excluirNaApi, requisicaoApi } from '@/compartilhado/servicos/api';
import { carregarContaDaSessao } from '@/compartilhado/servicos/autenticacao';

// Id da conta do consumidor logado, ou null (visitante / modo demonstração).
export function idConsumidorLogado() {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'CONSUMIDOR' ? conta.id : null;
}

function caminho(resto) {
  const id = idConsumidorLogado();

  if (!id) throw new Error('Entre com uma conta de consumidor para continuar.');
  return `/consumidor/${id}${resto}`;
}

// ---------- Vitrine (não precisa de login) ----------

// filtros opcionais: { categoria, idFeira, busca }
export function listarXepasDaApi(filtros = {}) {
  const parametros = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
  );
  const consulta = parametros.toString();

  return requisicaoApi(`/xepas${consulta ? `?${consulta}` : ''}`);
}

export function buscarXepaDaApi(id) {
  return requisicaoApi(`/xepas/${id}`);
}

// ---------- Perfil ----------

export function buscarPerfil() {
  return requisicaoApi(caminho('/perfil'));
}

// { nome, email, telefone } — campos ausentes ficam como estão.
export function atualizarPerfil(dados) {
  return enviarJson(caminho('/perfil'), dados, 'PUT');
}

export function trocarSenha(senhaAtual, novaSenha) {
  return enviarJson(caminho('/senha'), { senhaAtual, novaSenha }, 'PUT');
}

// ---------- Carrinho ----------

export function buscarCarrinho() {
  return requisicaoApi(caminho('/carrinho'));
}

// itens: [{ idXepa, quantidade }] — troca o carrinho inteiro.
export function substituirCarrinho(itens) {
  return enviarJson(caminho('/carrinho'), { itens }, 'PUT');
}

export function definirItemCarrinho(idXepa, quantidade) {
  return enviarJson(caminho(`/carrinho/itens/${idXepa}`), { quantidade }, 'PUT');
}

export function removerItemCarrinho(idXepa) {
  return excluirNaApi(caminho(`/carrinho/itens/${idXepa}`));
}

export function esvaziarCarrinho() {
  return excluirNaApi(caminho('/carrinho'));
}

// ---------- Pedidos ----------

// itens: [{ idXepa, quantidade }]
// recebimento: { tipo: 'retirada' } ou { tipo: 'entrega', endereco: {...}, fretes: [{ feira, valor }] }
// Devolve um pedido por feirante.
export function finalizarCompra({ itens, recebimento, metodoPagamento = 'PIX' }) {
  return enviarJson(caminho('/pedidos'), { itens, recebimento, metodoPagamento });
}

export function listarPedidos() {
  return requisicaoApi(caminho('/pedidos'));
}

export function buscarPedido(idPedido) {
  return requisicaoApi(caminho(`/pedidos/${idPedido}`));
}

// ---------- Impacto ----------

export function buscarImpacto() {
  return requisicaoApi(caminho('/impacto'));
}
