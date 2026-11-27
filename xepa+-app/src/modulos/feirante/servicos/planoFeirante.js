import { PLANOS } from '@/compartilhado/dados/planos';
import { idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';
import { enviarJson, requisicaoApi } from '@/compartilhado/servicos/api';

// Plano do feirante. Nenhuma cobrança é feita.
// - Feirante logado: o plano fica na API (/api/feirante/{idConta}/plano) e vale em qualquer aparelho;
//   a comissão dos pedidos sai do plano salvo lá. Uma cópia fica no navegador para mostrar na hora.
// - Modo demonstração: só neste navegador.
const CHAVE_PLANO = 'planoFeirante';

export const EVENTO_PLANO = 'plano-atualizado';

// O que cada plano libera, além das páginas que todos os feirantes usam.
const RECURSOS_DO_PLANO = {
  gratis: [],
  crescer: ['financeiro', 'ia'],
  pro: ['financeiro', 'planilhas', 'ia'],
};

// A demonstração usa a chave antiga; cada conta logada tem a sua.
// O login (autenticacao.js) grava nesta mesma chave o plano que a API devolve.
function chaveDoPlano() {
  const dono = idFeiranteAtual();

  return dono === 'demo' ? CHAVE_PLANO : `${CHAVE_PLANO}:${dono}`;
}

export function carregarPlanoSelecionado() {
  return localStorage.getItem(chaveDoPlano());
}

function guardarCopia(idPlano) {
  if (idPlano) localStorage.setItem(chaveDoPlano(), idPlano);
  else localStorage.removeItem(chaveDoPlano());
  window.dispatchEvent(new Event(EVENTO_PLANO));
}

// Muda na tela na hora; feirante logado também salva na API.
// Devolve uma Promise: se a API recusar, volta o plano anterior e o erro sobe para a tela.
export async function salvarPlanoSelecionado(idPlano) {
  const anterior = carregarPlanoSelecionado();
  guardarCopia(idPlano);

  const idConta = idFeiranteAtual();
  if (idConta === 'demo') return;

  try {
    await enviarJson(`/feirante/${idConta}/plano`, { codigo: idPlano }, 'PUT');
  } catch (falha) {
    guardarCopia(anterior);
    throw falha;
  }
}

// Ao abrir a área do feirante logado: traz o plano salvo na API.
// Plano escolhido antes de existir a API (só no navegador): envia para a API.
export async function sincronizarPlano() {
  const idConta = idFeiranteAtual();
  if (idConta === 'demo') return;

  try {
    const resposta = await requisicaoApi(`/feirante/${idConta}/plano`);
    const local = carregarPlanoSelecionado();

    if (resposta.escolhido) {
      if (resposta.plano.codigo !== local) guardarCopia(resposta.plano.codigo);
    } else if (local) {
      await enviarJson(`/feirante/${idConta}/plano`, { codigo: local }, 'PUT');
    }
  } catch {
    // Sem conexão: fica com a cópia deste navegador.
  }
}

// Sem plano escolhido, vale o mesmo bloqueio do plano Semente.
export function planoLiberaRecurso(idPlano, recurso) {
  return (RECURSOS_DO_PLANO[idPlano] || RECURSOS_DO_PLANO.gratis).includes(recurso);
}

// Comissão do Xepa+ (ex.: 0.15 = 15%). Sem plano escolhido, vale a do plano Semente.
export function taxaDoPlano(idPlano = carregarPlanoSelecionado()) {
  const plano = PLANOS.find((item) => item.id === idPlano) || PLANOS[0];

  return plano.taxa;
}
