const API_URL = import.meta.env.VITE_API_URL || '/api';

const SEM_CONEXAO = 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';

// Mesma chave de autenticacao.js (lida aqui direto para não criar import circular).
const CHAVE_SESSAO = 'xepaConta';

export const SESSAO_EXPIRADA = 'Sessão expirada. Entre novamente.';
export const EVENTO_SESSAO_EXPIRADA = 'sessao-expirada';

// Token do login (consumidor/feirante). As rotas da conta na API só respondem com ele.
function tokenDaConta() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || 'null')?.token || null;
  } catch {
    return null;
  }
}

function cabecalhos(extras = {}) {
  const token = tokenDaConta();

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extras,
  };
}

// Sem token válido a API devolve 401: a conta sai deste navegador e a pessoa entra de novo.
// (Inclui logins feitos antes do token existir, que ficaram sem ele.)
function tratarSessaoExpirada(resposta, opcoes) {
  if (resposta.status === 401 && !opcoes.headers?.Authorization && sessionStorage.getItem(CHAVE_SESSAO)) {
    sessionStorage.removeItem(CHAVE_SESSAO);
    window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
  }
}

export async function requisicaoApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: cabecalhos(opcoes.headers),
    });
  } catch {
    throw new Error(SEM_CONEXAO);
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    tratarSessaoExpirada(resposta, opcoes);
    throw new Error(dados?.detail || dados?.message || 'Não foi possível comunicar com a API.');
  }
  return dados;
}

export function enviarJson(caminho, dados, metodo = 'POST') {
  return requisicaoApi(caminho, {
    method: metodo,
    body: JSON.stringify(dados),
  });
}

export function excluirNaApi(caminho) {
  return requisicaoApi(caminho, { method: 'DELETE' });
}

// Fotos guardadas na API vêm como "/api/imagens/12": monta o endereço completo para o <img>.
export function urlDaApi(caminho) {
  if (!caminho || !caminho.startsWith('/api/')) return caminho || '';
  return `${API_URL}${caminho.slice(4)}`;
}

// Envia uma foto (data URL, já reduzida) e devolve o endereço salvo na API ("/api/imagens/12").
export async function enviarImagem(dataUrl) {
  const { url } = await enviarJson('/imagens', { dataUrl });
  return url;
}

// Baixa um arquivo gerado pela API (ex.: planilha CSV) com o nome informado.
export async function baixarArquivoDaApi(caminho, nomeArquivo) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, { headers: cabecalhos() });
  } catch {
    throw new Error(SEM_CONEXAO);
  }
  if (!resposta.ok) {
    tratarSessaoExpirada(resposta, {});
    const dados = await resposta.json().catch(() => null);
    throw new Error(dados?.message || 'Não foi possível gerar o arquivo.');
  }
  salvarArquivo(await resposta.blob(), nomeArquivo);
}

export function salvarArquivo(blob, nomeArquivo) {
  const endereco = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = endereco;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(endereco);
}
