// Carrinho do consumidor. Guarda só o id e a quantidade; o resto vem da xepa.
import { carregarXepasDisponiveis } from '@/compartilhado/servicos/xepas';
import { ENTREGA_CASA, RETIRADA_FEIRA } from '@/compartilhado/servicos/pedidos';

const CHAVE_CARRINHO = 'carrinhoXepa';
const CHAVE_RECEBIMENTO = 'recebimentoXepa';

export const EVENTO_CARRINHO = 'carrinho-atualizado';

export function carregarCarrinho() {
  return JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
}

function salvarCarrinho(itens) {
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(itens));
  window.dispatchEvent(new Event(EVENTO_CARRINHO));
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

export function limparCarrinho() {
  salvarCarrinho([]);
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
  const salvo = JSON.parse(localStorage.getItem(CHAVE_RECEBIMENTO)) || {};

  return {
    tipo: salvo.tipo === ENTREGA_CASA ? ENTREGA_CASA : RETIRADA_FEIRA,
    endereco: { ...ENDERECO_VAZIO, ...salvo.endereco },
    // Frete calculado para o endereço (ver servicos/frete.js).
    frete: salvo.frete || null,
  };
}

export function salvarRecebimento(recebimento) {
  localStorage.setItem(CHAVE_RECEBIMENTO, JSON.stringify(recebimento));
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
