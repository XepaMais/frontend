// Feiras dos feirantes. Sem backend, ficam neste navegador.
// Cada feira guarda o dono (idFeirante): o feirante vê só as suas; o consumidor vê todas.
import { ehDoFeiranteAtual, idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

const CHAVE_FEIRAS = 'feirasFeirante';

// Remove as feiras de exemplo antigas.
const NOMES_EXEMPLO = { 1: 'Rocinha do tio', 2: 'BemBom', 3: 'Fazendinha' };

function ehExemplo(feira) {
  return NOMES_EXEMPLO[feira.id] === feira.nome;
}

// Todas as feiras cadastradas (área do consumidor, mapa e frete).
export function carregarTodasFeiras() {
  const feiras = JSON.parse(localStorage.getItem(CHAVE_FEIRAS)) || [];

  return feiras.filter((feira) => !ehExemplo(feira));
}

// Só as feiras do feirante logado. Conta nova: lista vazia.
export function carregarFeiras() {
  return carregarTodasFeiras().filter(ehDoFeiranteAtual);
}

// Recebe a lista do feirante logado e mantém as feiras dos outros feirantes.
export function salvarFeiras(feiras) {
  const dono = idFeiranteAtual();
  const outras = carregarTodasFeiras().filter((feira) => !ehDoFeiranteAtual(feira));
  const minhas = feiras.map((feira) => ({ ...feira, idFeirante: dono }));

  localStorage.setItem(CHAVE_FEIRAS, JSON.stringify([...minhas, ...outras]));
}
