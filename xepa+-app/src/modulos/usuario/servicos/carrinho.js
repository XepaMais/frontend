// Carrinho do consumidor. Guarda só o id e a quantidade; o resto vem da xepa.
// Consumidor logado: as xepas da API também ficam no carrinho salvo na API
// (/api/consumidor/{idConta}/carrinho), para valer em qualquer aparelho.
import { buscarXepa, carregarXepasDisponiveis, ehXepaDaApi, xepaDaApi } from '@/compartilhado/servicos/xepas';
import { ENTREGA_CASA, RETIRADA_FEIRA } from '@/compartilhado/servicos/pedidos';
import { carregarContaDaSessao } from '@/compartilhado/servicos/autenticacao';
import {
  buscarCarrinho,
  idConsumidorLogado,
  substituirCarrinho,
} from '@/modulos/usuario/servicos/consumidorApi';

const CHAVE_CARRINHO = 'carrinhoXepa';
const CHAVE_RECEBIMENTO = 'recebimentoXepa';

export const EVENTO_CARRINHO = 'carrinho-atualizado';

// Cada consumidor logado tem o próprio carrinho: conta nova começa vazia.
// Sem login (demonstração), vale a chave antiga.
function chaveDaConta(chave) {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'CONSUMIDOR' ? `${chave}:${conta.id}` : chave;
}

export function carregarCarrinho() {
  return JSON.parse(localStorage.getItem(chaveDaConta(CHAVE_CARRINHO))) || [];
}

function salvarCarrinho(itens, { enviarParaApi = true } = {}) {
  localStorage.setItem(chaveDaConta(CHAVE_CARRINHO), JSON.stringify(itens));
  window.dispatchEvent(new Event(EVENTO_CARRINHO));
  if (enviarParaApi) enviarCarrinhoParaApi(itens);
}

// Só as xepas da API vão para o carrinho do servidor (as do modo demonstração não existem lá).
function itensDaApi(itens) {
  return itens
    .filter((item) => ehXepaDaApi(buscarXepa(item.id)))
    .map((item) => ({ idXepa: item.id, quantidade: item.quantidade }));
}

function enviarCarrinhoParaApi(itens) {
  if (!idConsumidorLogado()) return;
  // Em segundo plano: se falhar, o carrinho local continua valendo e é reenviado na próxima mudança.
  substituirCarrinho(itensDaApi(itens)).catch(() => {});
}

// Ao abrir o app logado: junta o carrinho salvo na API com o deste navegador.
export async function sincronizarCarrinho() {
  if (!idConsumidorLogado()) return;
  try {
    const remoto = await buscarCarrinho();
    const locais = carregarCarrinho();
    const juntos = [...locais];

    for (const item of remoto.itens) {
      if (!juntos.some((atual) => atual.id === item.id)) {
        juntos.push({ id: item.id, quantidade: Number(item.quantidade) });
      }
    }

    // Garante que as xepas do carrinho remoto estejam na cópia local da vitrine.
    guardarXepasDoCarrinho(remoto.itens.map((item) => item.xepa));
    salvarCarrinho(juntos, { enviarParaApi: juntos.length !== remoto.itens.length });
  } catch {
    // Sem conexão: fica com o carrinho local.
  }
}

function guardarXepasDoCarrinho(xepas) {
  const cache = JSON.parse(localStorage.getItem('xepasApi')) || [];
  const novas = xepas.filter((xepa) => !cache.some((atual) => atual.id === xepa.id)).map(xepaDaApi);

  if (novas.length) localStorage.setItem('xepasApi', JSON.stringify([...cache, ...novas]));
}

export function adicionarAoCarrinho(id) {
  const itens = carregarCarrinho();
  const jaEstaNoCarrinho = itens.some((item) => item.id === id);

  if (!jaEstaNoCarrinho) {
    salvarCarrinho([...itens, { id, quantidade: 1 }]);
  }
}

export function removerDoCarrinho(id) {
  salvarCarrinho(carregarCarrinho().filter((item) => item.id !== id));
}

export function alterarQuantidade(id, quantidade) {
  const itens = carregarCarrinho().map((item) => {
    if (item.id === id) {
      return { ...item, quantidade };
    }

    return item;
  });

  salvarCarrinho(itens);
}

// Depois da compra pela API o servidor já tirou os itens: não precisa reenviar.
export function limparCarrinho({ enviarParaApi = true } = {}) {
  salvarCarrinho([], { enviarParaApi });
}

// Junta o carrinho com os dados da xepa. Ignora o que esgotou, venceu ou saiu do ar.
export function montarItensCarrinho(itens) {
  const xepas = carregarXepasDisponiveis();
  const itensDetalhados = [];

  for (const item of itens) {
    const xepa = xepas.find((atual) => atual.id === item.id);

    if (xepa) {
      itensDetalhados.push({
        ...xepa,
        disponivel: xepa.quantidade,
        quantidade: Math.min(item.quantidade, xepa.quantidade),
      });
    }
  }

  return itensDetalhados;
}

export function calcularTotal(itens) {
  let total = 0;

  for (const item of itens) {
    total += item.preco * item.quantidade;
  }

  return total;
}

export function contarItens(itens) {
  let quantidade = 0;

  for (const item of itens) {
    quantidade += item.quantidade;
  }

  return quantidade;
}

// Forma de recebimento escolhida no carrinho (retirada na feira ou entrega em casa).
// Fica guardada para o pagamento e para as próximas compras.
export const ENDERECO_VAZIO = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
};

export function carregarRecebimento() {
  const salvo = JSON.parse(localStorage.getItem(chaveDaConta(CHAVE_RECEBIMENTO))) || {};

  return {
    tipo: salvo.tipo === ENTREGA_CASA ? ENTREGA_CASA : RETIRADA_FEIRA,
    endereco: { ...ENDERECO_VAZIO, ...salvo.endereco },
    // Frete calculado para o endereço (ver servicos/frete.js).
    frete: salvo.frete || null,
  };
}

export function salvarRecebimento(recebimento) {
  localStorage.setItem(chaveDaConta(CHAVE_RECEBIMENTO), JSON.stringify(recebimento));
}

// Campos obrigatórios para entregar em casa.
export function enderecoCompleto(endereco) {
  return Boolean(
    endereco.cep.replace(/\D/g, '').length === 8
      && endereco.logradouro.trim()
      && endereco.numero.trim()
      && endereco.bairro.trim()
      && endereco.cidade.trim()
      && endereco.uf.trim(),
  );
}

// O que vai junto com o pedido: endereço e frete só quando for entrega.
export function recebimentoParaPedido(recebimento) {
  if (recebimento.tipo === ENTREGA_CASA) {
    return {
      tipo: ENTREGA_CASA,
      endereco: { ...recebimento.endereco },
      frete: recebimento.frete,
    };
  }

  return { tipo: RETIRADA_FEIRA };
}
