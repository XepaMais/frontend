// Conversas entre consumidor e feirante.
// - Conta logada (consumidor ou feirante): as conversas ficam na API
//   (/api/{consumidor|feirante}/{idConta}/conversas) e valem em qualquer aparelho. Uma cópia fica em
//   'conversasApi:{idConta}' para as telas que leem a lista na hora; o hook useConversas atualiza sozinho.
// - Modo demonstração: as conversas ficam só neste navegador ('conversasXepa').
import { carregarPerfil } from '@/compartilhado/servicos/perfil';
import { carregarContaDaSessao, ehDoFeiranteAtual } from '@/compartilhado/servicos/autenticacao';
import { enviarJson, requisicaoApi } from '@/compartilhado/servicos/api';
import {
  atualizarStatusPedido,
  descreverRecebimento,
  formatarMoeda,
  pedidoDaApi,
  sincronizarVendas,
} from '@/compartilhado/servicos/pedidos';

const CHAVE_CONVERSAS = 'conversasXepa';

export const EVENTO_CONVERSAS = 'conversas-atualizadas';

export const STATUS_CONVERSA = {
  recente: 'recente',
  finalizada: 'finalizada',
};

const PREFIXO_API = 'api-';

function ultimaAtividade(conversa) {
  return conversa.mensagens.at(-1)?.data || conversa.finalizadaEm || conversa.criadaEm;
}

function ordenar(conversas) {
  return conversas.sort((a, b) => new Date(ultimaAtividade(b)) - new Date(ultimaAtividade(a)));
}

function avisar() {
  window.dispatchEvent(new Event(EVENTO_CONVERSAS));
}

// ---------- Conversas da API ----------

// Conta logada com token (consumidor ou feirante), ou null.
function contaLogada() {
  const conta = carregarContaDaSessao();

  return conta?.token && (conta.tipo === 'CONSUMIDOR' || conta.tipo === 'FEIRANTE') ? conta : null;
}

function rotaDaConta(conta, resto = '') {
  const papel = conta.tipo === 'FEIRANTE' ? 'feirante' : 'consumidor';
  return `/${papel}/${conta.id}/conversas${resto}`;
}

function chaveApi(conta) {
  return `conversasApi:${conta.id}`;
}

function carregarConversasDaApiEmCache() {
  const conta = contaLogada();

  return conta ? JSON.parse(localStorage.getItem(chaveApi(conta))) || [] : [];
}

function salvarConversasDaApi(conversas) {
  const conta = contaLogada();
  if (!conta) return;

  localStorage.setItem(chaveApi(conta), JSON.stringify(conversas));
  avisar();
}

export function ehConversaDaApi(id) {
  return String(id).startsWith(PREFIXO_API);
}

function idChat(id) {
  return String(id).slice(PREFIXO_API.length);
}

// Resposta da API -> mesmo formato das conversas locais.
function conversaDaApi(conversa) {
  const pedido = conversa.pedido ? pedidoDaApi(conversa.pedido) : null;

  return {
    ...conversa,
    id: `${PREFIXO_API}${conversa.id}`,
    idChat: conversa.id,
    origem: 'api',
    idFeirante: String(conversa.idFeirante),
    pedido: pedido && {
      id: pedido.id,
      numero: pedido.numero,
      data: pedido.data,
      total: pedido.total,
      retirada: pedido.itens[0]?.retirada || '',
      recebimento: descreverRecebimento(pedido),
      itens: pedido.itens.map(({ nome, quantidade, preco }) => ({ nome, quantidade, preco })),
    },
    xepa: conversa.xepa && { ...conversa.xepa, preco: Number(conversa.xepa.preco) },
  };
}

function guardarConversaDaApi(resposta) {
  const conversa = conversaDaApi(resposta);
  const outras = carregarConversasDaApiEmCache().filter((atual) => atual.id !== conversa.id);

  salvarConversasDaApi([conversa, ...outras]);
  return conversa;
}

// Busca as conversas na API. Sem conexão, mantém a última cópia.
export async function sincronizarConversas() {
  const conta = contaLogada();
  if (!conta) return false;

  try {
    const conversas = await requisicaoApi(rotaDaConta(conta));
    salvarConversasDaApi(conversas.map(conversaDaApi));
    return true;
  } catch {
    return false;
  }
}

// Troca a conversa na cópia local na hora (a tela responde rápido) enquanto a API confirma.
function alterarNaCopiaDaApi(id, alterar) {
  let alterada = null;
  const conversas = carregarConversasDaApiEmCache().map((conversa) => {
    if (conversa.id !== id) return conversa;
    alterada = alterar(conversa);
    return alterada;
  });

  if (alterada) salvarConversasDaApi(conversas);
  return alterada;
}

async function chamarApi(id, resto) {
  const conta = contaLogada();
  if (!conta) return null;

  try {
    return guardarConversaDaApi(await enviarJson(rotaDaConta(conta, `/${idChat(id)}${resto.caminho}`), resto.dados));
  } catch (falha) {
    // Desfaz a mudança da tela trazendo o estado real da API.
    sincronizarConversas();
    if (resto.avisarErro) window.alert(falha.message);
    return null;
  }
}

// ---------- Conversas locais (modo demonstração) ----------

function salvarConversas(conversas) {
  localStorage.setItem(CHAVE_CONVERSAS, JSON.stringify(conversas));
  avisar();
}

function carregarConversasLocais() {
  const salvas = JSON.parse(localStorage.getItem(CHAVE_CONVERSAS)) || [];

  return salvas
    // Remove as conversas de exemplo (Carneiro, Murilo...) que versões antigas salvavam.
    .filter((conversa) => !conversa.demo)
    // Conversas salvas antes das notificações: considera tudo como já lido.
    .map((conversa) => (conversa.leituras
      ? conversa
      : { ...conversa, leituras: { feirante: ultimaAtividade(conversa), consumidor: ultimaAtividade(conversa) } }));
}

function alterarConversa(id, alterar) {
  if (ehConversaDaApi(id)) return alterarNaCopiaDaApi(id, alterar);

  let alterada = null;
  const conversas = carregarConversasLocais().map((conversa) => {
    if (conversa.id !== id) return conversa;

    alterada = alterar(conversa);
    return alterada;
  });

  if (alterada) salvarConversas(conversas);
  return alterada;
}

// ---------- Usadas pelas telas ----------

export function carregarConversas() {
  return ordenar([...carregarConversasDaApiEmCache(), ...carregarConversasLocais()]);
}

// Área do feirante: só as conversas sobre as xepas dele. Conta nova: lista vazia.
export function carregarConversasDoFeirante() {
  return carregarConversas().filter(ehDoFeiranteAtual);
}

// Mensagens que o perfil ('feirante' ou 'consumidor') ainda não viu.
export function mensagensNaoLidas(conversa, perfil) {
  const lidoEm = conversa.leituras?.[perfil];

  return conversa.mensagens.filter((mensagem) => (
    mensagem.autor !== perfil && (!lidoEm || new Date(mensagem.data) > new Date(lidoEm))
  ));
}

export function marcarComoLida(id, perfil) {
  const alterada = alterarConversa(id, (conversa) => ({
    ...conversa,
    leituras: { ...conversa.leituras, [perfil]: new Date().toISOString() },
  }));

  if (ehConversaDaApi(id)) chamarApi(id, { caminho: '/leitura' });
  return alterada;
}

// Chamada ao confirmar o pagamento: o feirante já recebe o pedido no chat.
// O botão "Falar com vendedor" também usa: se o pedido já tem conversa, reaproveita.
// Pedido da API: a conversa foi aberta pela API no checkout (pedido.idConversa).
export function abrirConversaDoPedido(pedido) {
  if (pedido.origem === 'api') {
    sincronizarConversas();
    return pedido.idConversa ? `${PREFIXO_API}${pedido.idConversa}` : null;
  }

  const id = `pedido-${pedido.numero}`;
  const conversas = carregarConversasLocais();

  if (conversas.some((conversa) => conversa.id === id)) {
    return id;
  }

  const agora = new Date().toISOString();
  const novaConversa = {
    id,
    consumidor: carregarPerfil('usuario').nome,
    idFeirante: pedido.itens[0]?.idFeirante,
    feirante: pedido.itens[0]?.barraca || carregarPerfil('feirante').nome,
    status: STATUS_CONVERSA.recente,
    criadaEm: agora,
    finalizadaEm: null,

    // O consumidor acabou de fazer o pedido; o feirante ainda não viu.
    leituras: { feirante: null, consumidor: agora },
    pedido: {
      numero: pedido.numero,
      data: pedido.data,
      total: pedido.total,
      retirada: pedido.itens[0]?.retirada || '',
      // Ex.: { titulo: 'Entrega em casa', detalhe: 'Rua X, 10 - ...' }
      recebimento: descreverRecebimento(pedido),
      itens: pedido.itens.map(({ nome, quantidade, preco }) => ({ nome, quantidade, preco })),
    },
    mensagens: [
      {
        id: 1,
        autor: 'sistema',
        texto: `Novo pedido nº ${pedido.numero} realizado. Total: ${formatarMoeda(pedido.total)}.`,
        data: agora,
      },
    ],
  };

  salvarConversas([novaConversa, ...conversas]);
  return id;
}

// Conversa antes da compra, aberta pelo card "Perfil do feirante" na página da xepa.
// Não tem pedido: guarda só a xepa sobre a qual o consumidor quer saber.
export function idConversaDaXepa(xepa) {
  return `xepa-${xepa.id}`;
}

// Devolve o id da conversa (Promise). Consumidor logado + xepa da API: a conversa fica na API.
export async function abrirConversaDaXepa(xepa) {
  const conta = contaLogada();

  if (xepa.origem === 'api' && conta?.tipo === 'CONSUMIDOR') {
    const resposta = await enviarJson(rotaDaConta(conta), { idXepa: xepa.id });
    return guardarConversaDaApi(resposta).id;
  }

  const id = idConversaDaXepa(xepa);
  const conversas = carregarConversasLocais();
  const existente = conversas.find((conversa) => conversa.id === id);

  if (existente && existente.status !== STATUS_CONVERSA.finalizada) return id;

  const agora = new Date().toISOString();
  const novaConversa = {
    id,
    consumidor: carregarPerfil('usuario').nome,
    idFeirante: xepa.idFeirante,
    feirante: xepa.feirante || carregarPerfil('feirante').nome,
    status: STATUS_CONVERSA.recente,
    criadaEm: agora,
    finalizadaEm: null,
    leituras: { feirante: null, consumidor: agora },
    pedido: null,
    xepa: { id: xepa.id, nome: xepa.nome, preco: xepa.preco, feira: xepa.feira || '' },
    mensagens: [
      { id: 1, autor: 'sistema', texto: `Conversa sobre a ${xepa.nome}.`, data: agora },
    ],
  };

  salvarConversas([novaConversa, ...conversas.filter((conversa) => conversa.id !== id)]);
  return id;
}

// Texto curto que identifica a conversa: o pedido ou a xepa perguntada.
export function assuntoDaConversa(conversa) {
  if (conversa.pedido) return `Pedido nº ${conversa.pedido.numero}`;

  return `Dúvida: ${conversa.xepa?.nome || 'xepa'}`;
}

// autor: 'consumidor' ou 'feirante'. Conversas finalizadas não aceitam mensagens.
export function enviarMensagem(id, autor, texto) {
  const alterada = alterarConversa(id, (conversa) => {
    if (conversa.status === STATUS_CONVERSA.finalizada) return conversa;

    return {
      ...conversa,
      mensagens: [
        ...conversa.mensagens,
        { id: Date.now(), autor, texto, data: new Date().toISOString() },
      ],
      leituras: { ...conversa.leituras, [autor]: new Date().toISOString() },
    };
  });

  if (ehConversaDaApi(id)) chamarApi(id, { caminho: '/mensagens', dados: { texto }, avisarErro: true });
  return alterada;
}

// Botão "Pedido retirado" do feirante: move a conversa para Finalizadas.
export function finalizarConversa(id) {
  const conversa = alterarConversa(id, (atual) => ({
    ...atual,
    status: STATUS_CONVERSA.finalizada,
    finalizadaEm: new Date().toISOString(),
  }));

  if (ehConversaDaApi(id)) {
    // A API também marca o pedido como retirado.
    chamarApi(id, { caminho: '/finalizar', avisarErro: true }).then(() => sincronizarVendas());
    return conversa;
  }

  if (conversa?.pedido) {
    atualizarStatusPedido(conversa.pedido.numero, 'Retirado');
  }

  return conversa;
}

// "Confirmar entrega" na Home e no Histórico de vendas (modo demonstração): marca o pedido como
// retirado e move a conversa dele para Finalizadas, igual ao botão "Pedido retirado" do chat.
// Pedidos da API usam confirmarRetiradaNaApi (servicos/pedidos.js).
export function confirmarEntregaDoPedido(numero) {
  const id = `pedido-${numero}`;
  const conversa = carregarConversasLocais().find((item) => item.id === id);

  if (conversa && conversa.status !== STATUS_CONVERSA.finalizada) {
    finalizarConversa(id);
  }

  atualizarStatusPedido(numero, 'Retirado');
}
