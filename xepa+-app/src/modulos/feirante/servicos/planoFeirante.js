import { PLANOS } from '@/compartilhado/dados/planos';
import { idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

// Guarda só a escolha do plano, uma por conta de feirante. Nenhuma cobrança é feita.
const CHAVE_PLANO = 'planoFeirante';

export const EVENTO_PLANO = 'plano-atualizado';

// O que cada plano libera, além das páginas que todos os feirantes usam.
const RECURSOS_DO_PLANO = {
  gratis: [],
  crescer: ['financeiro', 'ia'],
  pro: ['financeiro', 'planilhas', 'ia'],
};

// A demonstração usa a chave antiga; cada conta logada tem a sua.
function chaveDoPlano() {
  const dono = idFeiranteAtual();

  return dono === 'demo' ? CHAVE_PLANO : `${CHAVE_PLANO}:${dono}`;
}

export function carregarPlanoSelecionado() {
  return localStorage.getItem(chaveDoPlano());
}

export function salvarPlanoSelecionado(idPlano) {
  localStorage.setItem(chaveDoPlano(), idPlano);
  window.dispatchEvent(new Event(EVENTO_PLANO));
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
