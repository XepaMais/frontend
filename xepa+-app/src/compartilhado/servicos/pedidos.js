// Pedidos registrados ao confirmar o pagamento. 
const CHAVE_PEDIDOS = 'pedidosXepa';

import { ehDoFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

export function carregarPedidos() {
  return JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];
}

// Área do feirante: só os pedidos com alguma xepa dele. Conta nova: lista vazia.
export function carregarVendasDoFeirante() {
  return carregarPedidos().filter((pedido) => pedido.itens.some(ehDoFeiranteAtual));
}

// Status usados na retirada do pedido.
export const PENDENTE_RETIRADA = 'Pendente de retirada';
export const RETIRADO = 'Retirado';

// Gera um número aleatório de 4 dígitos (de 1000 a 9999).
function gerarCodigoRetirada() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

// Formas de o consumidor receber a xepa.
export const RETIRADA_FEIRA = 'retirada';
export const ENTREGA_CASA = 'entrega';

// Endereço em uma linha só: "Rua X, 10 - apto 2 - Bairro, Cidade/UF - CEP 00000-000".
export function formatarEndereco(endereco) {
  if (!endereco) return '';

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
  if (formaRecebimento(pedido) !== ENTREGA_CASA) return pedido.status;

  return pedido.status === RETIRADO ? 'Entregue' : 'Aguardando entrega';
}

export function registrarPedido({ itens, total, recebimento }) {
  const pedidos = carregarPedidos();

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
  const pedidos = carregarPedidos().map((pedido) => (
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
