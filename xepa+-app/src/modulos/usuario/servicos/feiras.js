import { requisicaoApi } from '@/compartilhado/servicos/api';

// Todas as feiras cadastradas (GET /api/feiras).
export function listarFeiras() {
  return requisicaoApi('/feiras');
}

// Feiras perto de um ponto (GET /api/feiras/proximas).
export function buscarFeirasProximas(lat, lng, raioKm = 10) {
  const parametros = new URLSearchParams({ lat, lng, raioKm });
  return requisicaoApi(`/feiras/proximas?${parametros}`);
}
