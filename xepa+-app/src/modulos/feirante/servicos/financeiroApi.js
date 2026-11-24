// Liga o financeiro ao backend (AWS). Com um feirante logado, tudo vai para o banco, sem login (modo demonstração), as páginas continuam usando este navegador.
import { carregarContaDaSessao } from '@/compartilhado/servicos/autenticacao';

// Id da conta do feirante logado, ou null no modo demonstração.
export function contaDoFeirante() {
  const conta = carregarContaDaSessao();

  return conta?.tipo === 'FEIRANTE' ? conta.id : null;
}

export function caminhoFinanceiro(idConta, resto) {
  return `/financeiro/${idConta}${resto}`;
}

// Monta "?inicio=...&fim=..." ignorando filtros vazios.
export function parametros(filtros) {
  const busca = new URLSearchParams();

  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null && valor !== undefined) busca.set(chave, valor);
  }

  const texto = busca.toString();
  return texto ? `?${texto}` : '';
}
