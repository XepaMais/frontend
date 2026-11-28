const API_URL = import.meta.env.VITE_API_URL || '/api';

const SEM_CONEXAO = 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';

export async function requisicaoApi(caminho, opcoes = {}) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
    });
  } catch {
    throw new Error(SEM_CONEXAO);
  }

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
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

export async function baixarArquivoDaApi(caminho, nomeArquivo) {
  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`);
  } catch {
    throw new Error(SEM_CONEXAO);
  }
  if (!resposta.ok) {
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
