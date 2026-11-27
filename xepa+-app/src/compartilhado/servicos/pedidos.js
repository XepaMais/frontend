// Pedidos registrados ao confirmar o pagamento.
// - Consumidor logado comprando xepas da API: o pedido fica na API (/api/consumidor/{idConta}/pedidos)
//   e uma cópia vai para 'pedidosApi' (impacto, chat e listas leem na hora).
// - Modo demonstração: o pedido fica só neste navegador ('pedidosXepa').
const CHAVE_PEDIDOS = 'pedidosXepa';
const CHAVE_PEDIDOS_API = 'pedidosApi';

export const EVENTO_PEDIDOS = 'pedidos-atualizados';

import { carregarContaDaSessao, ehDoFeiranteAtual } from '@/compartilhado/servicos/autenticacao';
import { enviarJson, requisicaoApi, urlDaApi } from '@/compartilhado/servicos/api';
import imagemPadrao from '@/assets/imagens/gerais/xepaCompleta.jpg';

function carregarPedidosLocais() {
  return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];
}

// Cópia dos pedidos da API do consumidor logado (cada conta tem a sua).
function chavePedidosApi() {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'CONSUMIDOR' ? `${CHAVE_PEDIDOS_API}:${conta.id}` : null;
}

function carregarPedidosDaApiEmCache() {
  const chave = chavePedidosApi();

  return chave ? JSON.parse(localStorage.getItem(chave)) || [] : [];
}

// Mais recentes primeiro, juntando API e modo demonstração.
export function carregarPedidos() {
  return [...carregarPedidosDaApiEmCache(), ...carregarPedidosLocais()]
    .sort((a, b) => new Date(b.data) - new Date(a.data));
}

// Chave única do pedido nas listas (números da API e locais podem coincidir).
export function chavePedido(pedido) {
  return pedido.origem === 'api' ? `api-${pedido.id}` : pedido.numero;
}

// Resposta da API -> mesmo formato dos pedidos locais.
export function pedidoDaApi(pedido) {
  const entrega = pedido.recebimento?.tipo === ENTREGA_CASA;

  return {
    id: pedido.id,
    origem: 'api',
    numero: pedido.numero,
    data: pedido.data,
    status: pedido.status,
    codigo: pedido.codigo,
    // Conversa do pedido no chat (aberta pela API no checkout).
    idConversa: pedido.idConversa,
    // Nota dada pelo consumidor depois da retirada: { nota, comentario, data } ou null.
    avaliacao: pedido.avaliacao || null,
    consumidor: pedido.consumidor,
    total: Number(pedido.total),
    itens: pedido.itens.map((item) => ({
      id: item.id,
      idFeirante: String(item.idFeirante),
      nome: item.nome,
      categoria: item.categoria,
      descricao: (item.descricao || '').replace('\n---\n', ' — ').replace(/^ — | — $/g, ''),
      barraca: item.barraca || item.feira,
      retirada: item.retirada ? `${item.feira} - ${item.retirada}` : item.feira,
      quantidade: Number(item.quantidade),
      preco: Number(item.preco),
      imagem: urlDaApi(item.imagem) || imagemPadrao,
    })),
    recebimento: entrega
      ? {
        tipo: ENTREGA_CASA,
        endereco: pedido.recebimento.endereco,
        frete: { valor: Number(pedido.recebimento.frete?.valor || 0), entregas: [] },
      }
      : { tipo: RETIRADA_FEIRA },
  };
}

export function guardarPedidosDaApi(pedidos) {
  const chave = chavePedidosApi();
  if (!chave) return;

  const novos = pedidos.map(pedidoDaApi);
  const outros = carregarPedidosDaApiEmCache().filter((pedido) => !novos.some((novo) => novo.id === pedido.id));
  localStorage.setItem(chave, JSON.stringify([...novos, ...outros]));
  window.dispatchEvent(new Event(EVENTO_PEDIDOS));
}

// Consumidor avalia o pedido já retirado (nota de 1 a 5). Avaliar de novo troca a nota.
export async function avaliarPedido(pedido, nota, comentario) {
  const conta = carregarContaDaSessao();
  const atualizado = await enviarJson(
    `/consumidor/${conta.id}/pedidos/${pedido.id}/avaliacao`,
    { nota, comentario },
    'PUT',
  );
  guardarPedidosDaApi([atualizado]);
  return pedidoDaApi(atualizado);
}

// Busca o histórico na API (consumidor logado). Sem conexão, mantém a última cópia.
export async function sincronizarPedidos() {
  const conta = carregarContaDaSessao();
  if (conta?.tipo !== 'CONSUMIDOR') return false;

  try {
    const pedidos = await requisicaoApi(`/consumidor/${conta.id}/pedidos`);
    localStorage.setItem(chavePedidosApi(), JSON.stringify(pedidos.map(pedidoDaApi)));
    window.dispatchEvent(new Event(EVENTO_PEDIDOS));
    return true;
  } catch {
    return false;
  }
}

// ---------- Vendas do feirante ----------
// Feirante logado: as vendas vêm da API (GET /api/feirante/{idConta}/pedidos), sem o código de
// retirada (só o consumidor tem; a API confere o código digitado).

function chaveVendasApi() {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'FEIRANTE' ? `vendasApi:${conta.id}` : null;
}

function carregarVendasDaApiEmCache() {
  const chave = chaveVendasApi();

  return chave ? JSON.parse(localStorage.getItem(chave)) || [] : [];
}

// Área do feirante: só os pedidos com alguma xepa dele. Conta nova: lista vazia.
export function carregarVendasDoFeirante() {
  const locais = carregarPedidosLocais().filter((pedido) => pedido.itens.some(ehDoFeiranteAtual));

  return [...carregarVendasDaApiEmCache(), ...locais].sort((a, b) => new Date(b.data) - new Date(a.data));
}

export async function sincronizarVendas() {
  const conta = carregarContaDaSessao();
  if (conta?.tipo !== 'FEIRANTE') return false;

  try {
    const vendas = await requisicaoApi(`/feirante/${conta.id}/pedidos`);
    localStorage.setItem(chaveVendasApi(), JSON.stringify(vendas.map(pedidoDaApi)));
    window.dispatchEvent(new Event(EVENTO_PEDIDOS));
    return true;
  } catch {
    return false;
  }
}

// O feirante digita o código que o cliente mostra; a API confere e marca como retirado.
export async function confirmarRetiradaNaApi(pedido, codigo) {
  const conta = carregarContaDaSessao();
  const atualizado = pedidoDaApi(await enviarJson(
    `/feirante/${conta.id}/pedidos/${pedido.id}/retirada`,
    { codigo },
  ));
  const chave = chaveVendasApi();
  if (chave) {
    const vendas = carregarVendasDaApiEmCache().map((venda) => (venda.id === atualizado.id ? atualizado : venda));
    localStorage.setItem(chave, JSON.stringify(vendas));
  }
  window.dispatchEvent(new Event(EVENTO_PEDIDOS));
  return atualizado;
}

// Cancelamento antes da retirada (pedidos da API): o estoque volta para a vitrine e o Pix é
// marcado como estornado. Consumidor cancela o próprio pedido; feirante cancela a venda.
export async function cancelarPedidoNaApi(pedido) {
  const conta = carregarContaDaSessao();

  if (conta?.tipo === 'FEIRANTE') {
    const atualizado = pedidoDaApi(await enviarJson(`/feirante/${conta.id}/pedidos/${pedido.id}/cancelar`, {}));
    const chave = chaveVendasApi();
    if (chave) {
      const vendas = carregarVendasDaApiEmCache().map((venda) => (venda.id === atualizado.id ? atualizado : venda));
      localStorage.setItem(chave, JSON.stringify(vendas));
    }
    window.dispatchEvent(new Event(EVENTO_PEDIDOS));
    return atualizado;
  }

  const resposta = await enviarJson(`/consumidor/${conta.id}/pedidos/${pedido.id}/cancelar`, {});
  guardarPedidosDaApi([resposta]);
  return pedidoDaApi(resposta);
}

// Status usados na retirada do pedido.
export const PENDENTE_RETIRADA = 'Pendente de retirada';
export const RETIRADO = 'Retirado';
export const CANCELADO = 'Cancelado';

// Gera um número aleatório de 4 dígitos (de 1000 a 9999).
function gerarCodigoRetirada() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

// Formas de o consumidor receber a xepa.
export const RETIRADA_FEIRA = 'retirada';
export const ENTREGA_CASA = 'entrega';

// Endereço em uma linha só.
export function formatarEndereco(endereco) {
  if (!endereco) return '';
  // Pedidos da API já trazem o endereço numa linha.
  if (typeof endereco === 'string') return endereco;

  const rua = [endereco.logradouro, endereco.numero].filter(Boolean).join(', ');
  const cidade = [endereco.cidade, endereco.uf].filter(Boolean).join('/');
  const local = [endereco.bairro, cidade].filter(Boolean).join(', ');
  const cep = endereco.cep ? `CEP ${endereco.cep}` : '';

  return [rua, endereco.complemento, local, cep].filter(Boolean).join(' - ');
}

// Pedidos antigos (antes da escolha existir) eram sempre retirada na feira.
export function formaRecebimento(pedido) {
  return pedido.recebimento?.tipo === ENTREGA_CASA ? ENTREGA_CASA : RETIRADA_FEIRA;
}

// Título e detalhe da forma de recebimento, para mostrar nas listas de pedidos.
export function descreverRecebimento(pedido) {
  if (formaRecebimento(pedido) === ENTREGA_CASA) {
    const frete = pedido.recebimento.frete;

    return {
      titulo: 'Entrega em casa',
      detalhe: formatarEndereco(pedido.recebimento.endereco),
      // Taxa e distância (pedidos de entrega antigos não têm).
      taxa: frete ? frete.valor : null,
      distancias: frete ? frete.entregas.map((entrega) => entrega.distanciaKm) : [],
    };
  }

  // Um pedido pode ter itens de feiras diferentes: lista cada local uma vez só.
  const locais = [...new Set(pedido.itens.map((item) => item.retirada).filter(Boolean))];

  return {
    titulo: 'Retirada na feira',
    detalhe: locais.join(' • '),
    taxa: null,
    distancias: [],
  };
}

// Taxa de entrega em uma linha: "Taxa de entrega R$ 6,79 (3,2 km)".
export function textoTaxaEntrega(recebimento) {
  if (recebimento.taxa == null) return '';

  const km = recebimento.distancias
    .map((distancia) => `${distancia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`)
    .join(' + ');

  return `Taxa de entrega ${formatarMoeda(recebimento.taxa)}${km ? ` (${km})` : ''}`;
}

// O status salvo continua o mesmo; só o texto muda quando o pedido é entregue em casa.
export function textoStatus(pedido) {
  if (pedido.status === CANCELADO || formaRecebimento(pedido) !== ENTREGA_CASA) return pedido.status;

  return pedido.status === RETIRADO ? 'Entregue' : 'Aguardando entrega';
}

export function registrarPedido({ itens, total, recebimento }) {
  const pedidos = carregarPedidosLocais();

  const novoPedido = {
    numero: String(pedidos.length + 1).padStart(4, '0'),
    data: new Date().toISOString(),
    itens,
    total,
    status: PENDENTE_RETIRADA,
    codigo: gerarCodigoRetirada(),
    // { tipo: 'retirada' } ou { tipo: 'entrega', endereco: {...} }
    recebimento: recebimento || { tipo: RETIRADA_FEIRA },
  };

  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify([novoPedido, ...pedidos]));
  return novoPedido;
}

// Usado quando o feirante marca o pedido como retirado no chat.
export function atualizarStatusPedido(numero, status) {
  const pedidos = carregarPedidosLocais().map((pedido) => (
    pedido.numero === numero ? { ...pedido, status } : pedido
  ));

  localStorage.setItem(CHAVE_PEDIDOS, JSON.stringify(pedidos));
}

export function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
