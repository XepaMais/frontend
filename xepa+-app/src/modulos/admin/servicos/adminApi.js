import { requisicaoApi, enviarJson } from '@/compartilhado/servicos/api';

const CHAVE_TOKEN = 'xepaAdminToken';

export const SESSAO_EXPIRADA = 'Sessão expirada. Entre novamente.';

export function tokenAdmin() {
  return sessionStorage.getItem(CHAVE_TOKEN);
}

export function sairAdmin() {
  sessionStorage.removeItem(CHAVE_TOKEN);
}

export async function entrarAdmin(email, senha) {
  const { token } = await enviarJson('/admin/login', { email, senha });
  sessionStorage.setItem(CHAVE_TOKEN, token);
}

async function chamar(caminho, opcoes = {}) {
  try {
    return await requisicaoApi(caminho, {
      ...opcoes,
      headers: { Authorization: `Bearer ${tokenAdmin()}`, ...opcoes.headers },
    });
  } catch (erro) {
    if (erro.message === SESSAO_EXPIRADA) sairAdmin();
    throw erro;
  }
}

const tabela = (nome) => `/admin/tabelas/${encodeURIComponent(nome)}`;

export function listarTabelas() {
  return chamar('/admin/tabelas');
}

export function listarLinhas(nome, { pagina = 0, tamanho = 25, busca = '' } = {}) {
  const params = new URLSearchParams({ pagina, tamanho });
  if (busca.trim()) params.set('busca', busca.trim());
  return chamar(`${tabela(nome)}?${params}`);
}

export function inserirLinha(nome, valores) {
  return chamar(tabela(nome), { method: 'POST', body: JSON.stringify(valores) });
}

export function atualizarLinha(nome, id, valores) {
  return chamar(`${tabela(nome)}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(valores),
  });
}

export function excluirLinha(nome, id) {
  return chamar(`${tabela(nome)}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
