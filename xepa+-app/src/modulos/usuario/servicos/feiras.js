import { requisicaoApi } from '@/compartilhado/servicos/api';

// Todas as feiras cadastradas (GET /api/feiras) — mapa geral.
export function listarFeiras() {
  return requisicaoApi('/feiras');
}

// Feiras com o texto no nome, sem diferença de acento/maiúscula (GET /api/feiras?busca=...).
export function buscarFeirasPorNome(nome) {
  return requisicaoApi(`/feiras?${new URLSearchParams({ busca: nome })}`);
}

// Feiras perto de um ponto (GET /api/feiras/proximas).
export function buscarFeirasProximas(lat, lng, raioKm = 10) {
  const parametros = new URLSearchParams({ lat, lng, raioKm });
  return requisicaoApi(`/feiras/proximas?${parametros}`);
}
