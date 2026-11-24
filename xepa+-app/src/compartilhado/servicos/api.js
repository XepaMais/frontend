// Padrão "/api": no dev o Vite faz proxy para localhost:8080; na Vercel o
// vercel.json repassa para o backend na AWS. Defina VITE_API_URL só se quiser
// chamar o backend direto (ex.: https://api.seudominio.com/api).
const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function requisicaoApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      ...opcoes.headers,
    },
  });

  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    throw new Error(dados?.detail || dados?.message || 'Não foi possível comunicar com a API.');
  }
  return dados;
}

export function enviarJson(caminho, dados) {
  return requisicaoApi(caminho, {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}
