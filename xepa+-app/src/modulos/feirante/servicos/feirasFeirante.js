// Feiras dos feirantes.
// Feirante logado: as feiras ficam na API (/api/feiras/feirante/{idConta}) e aparecem no mapa do consumidor.
// Modo demonstração: ficam só neste navegador.
// Nos dois casos uma cópia fica no localStorage, para as telas que leem a lista na hora (produto, frete...).
import { requisicaoApi, enviarJson, excluirNaApi } from '@/compartilhado/servicos/api';
import { ehDoFeiranteAtual, idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

const CHAVE_FEIRAS = 'feirasFeirante';

// Remove as feiras de exemplo antigas.
const NOMES_EXEMPLO = { 1: 'Rocinha do tio', 2: 'BemBom', 3: 'Fazendinha' };

// O formulário usa nomes de dias; a API usa 1=segunda ... 7=domingo.
const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function ehExemplo(feira) {
  return NOMES_EXEMPLO[feira.id] === feira.nome;
}

function estaLogado() {
  return idFeiranteAtual() !== 'demo';
}

function caminho(resto = '') {
  return `/feiras/feirante/${idFeiranteAtual()}${resto}`;
}

// Todas as feiras guardadas neste navegador (frete, perfil do feirante...).
export function carregarTodasFeiras() {
  const feiras = JSON.parse(localStorage.getItem(CHAVE_FEIRAS)) || [];

  return feiras.filter((feira) => !ehExemplo(feira));
}

// Só as feiras do feirante logado (cópia local). Conta nova: lista vazia.
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

// Formulário → API.
function paraApi(dados) {
  const [cidade, uf] = (dados.cidade || '').split(' - ').map((parte) => parte.trim());

  return {
    nome: dados.nome,
    endereco: dados.rua || dados.endereco,
    numero: dados.numero,
    cep: dados.cep,
    cidade,
    uf,
    dias: (dados.dias || []).map((dia) => DIAS.indexOf(dia) + 1).filter((dia) => dia > 0),
    horarioInicio: dados.horarioInicio || null,
    horarioFim: dados.horarioFim || null,
    latitude: dados.latitude,
    longitude: dados.longitude,
  };
}

// API → formato usado nas telas. Funcionários ainda não vão para a API: ficam na cópia local.
function daApi(feira, funcionarios = []) {
  const inicio = feira.horarioInicio?.slice(0, 5) || '';
  const fim = feira.horarioFim?.slice(0, 5) || '';
  const cep = feira.cep ? `${feira.cep.slice(0, 5)}-${feira.cep.slice(5)}` : '';

  return {
    id: feira.id,
    nome: feira.nome,
    rua: feira.endereco,
    numero: feira.numero || '',
    endereco: feira.numero ? `${feira.endereco}, ${feira.numero}` : feira.endereco,
    cep,
    cidade: feira.uf ? `${feira.cidade} - ${feira.uf}` : feira.cidade,
    latitude: Number(feira.latitude),
    longitude: Number(feira.longitude),
    dias: (feira.dias || []).map((dia) => DIAS[dia - 1]).filter(Boolean),
    horarioInicio: inicio,
    horarioFim: fim,
    horario: inicio && fim ? `${inicio} às ${fim}` : '',
    funcionarios,
  };
}

function funcionariosLocais(id) {
  return carregarFeiras().find((feira) => feira.id === id)?.funcionarios || [];
}

// Lista as feiras do feirante (da API quando logado) e atualiza a cópia local.
export async function buscarMinhasFeiras() {
  if (!estaLogado()) return carregarFeiras();

  const lista = await requisicaoApi(caminho());
  const feiras = lista.map((feira) => daApi(feira, funcionariosLocais(feira.id)));
  salvarFeiras(feiras);
  return feiras;
}

export async function criarFeira(dados) {
  if (!estaLogado()) {
    const feira = { id: Date.now(), ...dados };
    salvarFeiras([...carregarFeiras(), feira]);
    return feira;
  }

  const salva = await enviarJson(caminho(), paraApi(dados));
  const feira = daApi(salva, dados.funcionarios);
  salvarFeiras([...carregarFeiras(), feira]);
  return feira;
}

export async function atualizarFeira(id, dados) {
  let feira;
  if (estaLogado()) {
    const salva = await enviarJson(caminho(`/${id}`), paraApi(dados), 'PUT');
    feira = daApi(salva, dados.funcionarios);
  } else {
    feira = { ...carregarFeiras().find((item) => item.id === id), ...dados, id };
  }

  salvarFeiras(carregarFeiras().map((item) => (item.id === id ? feira : item)));
  return feira;
}

export async function excluirFeira(id) {
  if (estaLogado()) await excluirNaApi(caminho(`/${id}`));
  salvarFeiras(carregarFeiras().filter((feira) => feira.id !== id));
}
