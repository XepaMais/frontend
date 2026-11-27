// Xepas exibidas ao consumidor.
// - Da API (/api/xepas): publicadas por feirantes logados. Ficam numa cópia local
//   ('xepasApi') para as telas que leem a lista na hora (cards, carrinho, frete...).
// - Locais ('produtosFeirante'): cadastradas no modo demonstração, só neste navegador.
import { dataDeHoje } from '@/compartilhado/servicos/datas';
import { requisicaoApi, urlDaApi } from '@/compartilhado/servicos/api';

const CHAVE_XEPAS = 'produtosFeirante';
const CHAVE_XEPAS_API = 'xepasApi';

export const EVENTO_XEPAS = 'xepas-atualizadas';

export const CATEGORIAS_XEPA = ['Verduras e legumes', 'Frutas', 'Tempero', 'Completa'];

// Xepas salvas antes de as categorias mudarem.
const CATEGORIAS_ANTIGAS = {
  Verduras: 'Verduras e legumes',
  Legumes: 'Verduras e legumes',
  Outros: 'Completa',
};

// Dias da API (1=segunda ... 7=domingo) no formato do front.
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Só as xepas do modo demonstração (as que o navegador pode alterar).
export function carregarXepasLocais() {
  const xepas = JSON.parse(localStorage.getItem(CHAVE_XEPAS)) || [];

  return xepas.map((xepa) => ({
    ...xepa,
    categoria: CATEGORIAS_ANTIGAS[xepa.categoria] || xepa.categoria,
  }));
}

function carregarXepasDaApiEmCache() {
  return JSON.parse(localStorage.getItem(CHAVE_XEPAS_API)) || [];
}

// Todas: as da API primeiro, depois as do modo demonstração.
export function carregarXepas() {
  return [...carregarXepasDaApiEmCache(), ...carregarXepasLocais()];
}

// Grava só as xepas locais (as da API vêm sempre do servidor).
export function salvarXepas(xepas) {
  localStorage.setItem(CHAVE_XEPAS, JSON.stringify(xepas.filter((xepa) => xepa.origem !== 'api')));
}

// Resposta da API -> mesmo formato das xepas locais.
export function xepaDaApi(xepa) {
  return {
    ...xepa,
    origem: 'api',
    preco: Number(xepa.preco),
    quantidade: Number(xepa.quantidade),
    precoReferencia: xepa.precoReferencia == null ? null : Number(xepa.precoReferencia),
    // Sem validade = não vence.
    validade: xepa.validade || '',
    cadastradoEm: xepa.dataCadastro || xepa.dataRetirada,
    dias: (xepa.dias || []).map((dia) => DIAS[dia - 1]).filter(Boolean),
    idFeirante: String(xepa.idFeirante),
    // Foto guardada na API (/api/imagens/{id}): aparece em qualquer aparelho.
    imagem: urlDaApi(xepa.imagem),
  };
}

// Busca a vitrine na API e atualiza a cópia local. Sem conexão, mantém a última cópia.
export async function sincronizarXepas() {
  try {
    const xepas = await requisicaoApi('/xepas');
    localStorage.setItem(CHAVE_XEPAS_API, JSON.stringify(xepas.map(xepaDaApi)));
    window.dispatchEvent(new Event(EVENTO_XEPAS));
    return true;
  } catch {
    return false;
  }
}

// Para o consumidor: só o que ainda tem estoque e não venceu.
export function carregarXepasDisponiveis() {
  const hoje = dataDeHoje();

  return carregarXepas().filter((xepa) => xepa.quantidade > 0 && (!xepa.validade || xepa.validade >= hoje));
}

export function buscarXepa(id) {
  return carregarXepas().find((xepa) => String(xepa.id) === String(id));
}

export function ehXepaDaApi(xepa) {
  return xepa?.origem === 'api';
}

// Desconta do estoque local o que foi comprado (a API baixa o estoque das xepas dela).
export function baixarEstoque(itens) {
  const xepas = carregarXepasLocais().map((xepa) => {
    const comprado = itens.find((item) => item.id === xepa.id && !ehXepaDaApi(item));

    if (comprado) {
      return { ...xepa, quantidade: Math.max(0, xepa.quantidade - comprado.quantidade) };
    }

    return xepa;
  });

  salvarXepas(xepas);
}
