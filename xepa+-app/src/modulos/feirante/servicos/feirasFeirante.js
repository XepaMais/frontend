// Feiras ficam no banco da API (nuvem). Rua, cidade e coordenadas do mapa são
// descobertas pelo servidor a partir do CEP e do número.
import { requisicaoApi } from '@/compartilhado/servicos/api';
import { carregarContaDaSessao } from '@/compartilhado/servicos/autenticacao';

// Cópia em memória da última lista buscada, para telas que precisam do valor na hora
// (ex.: select de feira, frete). Some ao recarregar a página: a fonte é sempre a API.
let feirasEmMemoria = [];

function contaId() {
  const conta = carregarContaDaSessao();
  if (!conta?.id) throw new Error('Entre na sua conta de feirante para gerenciar feiras.');
  return conta.id;
}

// Feiras do feirante logado.
export async function buscarMinhasFeiras() {
  feirasEmMemoria = await requisicaoApi(`/feiras/conta/${contaId()}`);
  return feirasEmMemoria;
}

// Todas as feiras com lugar no mapa (públicas).
export async function buscarFeirasDoMapa() {
  const feiras = await requisicaoApi('/feiras');
  if (feirasEmMemoria.length === 0) feirasEmMemoria = feiras;
  return feiras;
}

export function criarFeira(dados) {
  return requisicaoApi(`/feiras/conta/${contaId()}`, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export function atualizarFeira(id, dados) {
  return requisicaoApi(`/feiras/conta/${contaId()}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  });
}

export function excluirFeira(id) {
  return requisicaoApi(`/feiras/conta/${contaId()}/${id}`, { method: 'DELETE' });
}

// Última lista já buscada (síncrono).
export function carregarFeiras() {
  return feirasEmMemoria;
}

// Já deixa a lista pronta para quem usa carregarFeiras().
const contaAtual = carregarContaDaSessao();
(contaAtual?.tipo === 'FEIRANTE' ? buscarMinhasFeiras() : buscarFeirasDoMapa()).catch(() => {});
