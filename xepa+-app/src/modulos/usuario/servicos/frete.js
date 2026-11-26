// Frete da entrega em casa, no estilo dos apps de delivery (valores fictícios).
// Cada feira entrega separado: a taxa é calculada pela distância da feira até o endereço.
// Futuramente: trocar calcularFrete pela cotação da API do Uber, mantendo o retorno
// ({ chave, entregas: [{ feira, distanciaKm, valor, tempo, foraDoRaio }], valor, foraDoRaio }).
import { geocodificarEndereco } from '@/compartilhado/servicos/localizacao';
import { carregarTodasFeiras } from '@/modulos/feirante/servicos/feirasFeirante';

// Tabela fictícia de frete.
export const TABELA_FRETE = {
  taxaBase: 4.99, // até 2 km
  kmInclusos: 2,
  valorPorKm: 1.5, // cada km depois dos 2 primeiros
  raioMaximoKm: 15, // acima disso a feira não entrega
  minutosPreparo: 20,
  minutosPorKm: 4,
};

const CHAVE_COORDENADAS = 'coordenadasXepa';

// Coordenadas já buscadas ficam guardadas para não consultar o mapa toda hora.
function carregarCache() {
  return JSON.parse(localStorage.getItem(CHAVE_COORDENADAS)) || {};
}

async function buscarCoordenadas(endereco) {
  const cache = carregarCache();

  if (cache[endereco] !== undefined) return cache[endereco];

  let coordenadas;

  try {
    coordenadas = await geocodificarEndereco(endereco);
  } catch {
    coordenadas = null;
  }

  localStorage.setItem(CHAVE_COORDENADAS, JSON.stringify({ ...carregarCache(), [endereco]: coordenadas }));
  return coordenadas;
}

// Distância em linha reta entre dois pontos (fórmula de Haversine).
function distanciaKm(a, b) {
  const raioTerra = 6371;
  const radianos = (graus) => (graus * Math.PI) / 180;
  const dLat = radianos(b.latitude - a.latitude);
  const dLng = radianos(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(radianos(a.latitude)) * Math.cos(radianos(b.latitude)) * Math.sin(dLng / 2) ** 2;

  return 2 * raioTerra * Math.asin(Math.sqrt(h));
}

// Se o mapa não acha o endereço, usa uma distância fixa por CEP e feira (1 a 10 km).
function distanciaAproximada(cep, feira) {
  let soma = 0;

  for (const letra of `${cep}${feira}`) {
    soma = (soma * 31 + letra.charCodeAt(0)) % 9973;
  }

  return 1 + (soma % 90) / 10;
}

// O trajeto real pelas ruas é maior que a linha reta: soma 30%.
const FATOR_RUAS = 1.3;

export function calcularTaxa(distancia) {
  const { taxaBase, kmInclusos, valorPorKm } = TABELA_FRETE;
  const kmExtras = Math.max(0, distancia - kmInclusos);

  return Math.round((taxaBase + kmExtras * valorPorKm) * 100) / 100;
}

export function calcularTempo(distancia) {
  const minimo = Math.round(TABELA_FRETE.minutosPreparo + distancia * TABELA_FRETE.minutosPorKm);
  return { minimo, maximo: minimo + 10 };
}

// Feiras diferentes do carrinho (cada uma é uma entrega).
function feirasDoCarrinho(itens) {
  const feiras = [];

  for (const item of itens) {
    const nome = item.feira || item.barraca || 'Feira';

    if (!feiras.some((feira) => feira.nome === nome)) {
      feiras.push({ nome, local: item.local || '' });
    }
  }

  return feiras;
}

async function coordenadasDaFeira(feira, endereco) {
  // Primeiro tenta a feira cadastrada (já tem latitude e longitude).
  const cadastrada = carregarTodasFeiras().find(
    (atual) => atual.nome === feira.nome && atual.latitude != null,
  );

  if (cadastrada) return { latitude: cadastrada.latitude, longitude: cadastrada.longitude };
  if (!feira.local) return null;

  return buscarCoordenadas(`${feira.local}, ${endereco.cidade} - ${endereco.uf}`);
}

// Calcula o frete de cada feira até o endereço de entrega.
export async function calcularFrete(itens, endereco) {
  const enderecoTexto = `${endereco.logradouro}, ${endereco.numero}, ${endereco.bairro}, `
    + `${endereco.cidade} - ${endereco.uf}`;
  const destino = await buscarCoordenadas(enderecoTexto);
  const entregas = [];

  for (const feira of feirasDoCarrinho(itens)) {
    const origem = destino ? await coordenadasDaFeira(feira, endereco) : null;
    const distancia = origem && destino
      ? distanciaKm(origem, destino) * FATOR_RUAS
      : distanciaAproximada(endereco.cep, feira.nome);
    const distanciaArredondada = Math.round(distancia * 10) / 10;
    const foraDoRaio = distanciaArredondada > TABELA_FRETE.raioMaximoKm;

    entregas.push({
      feira: feira.nome,
      distanciaKm: distanciaArredondada,
      valor: foraDoRaio ? 0 : calcularTaxa(distanciaArredondada),
      tempo: calcularTempo(distanciaArredondada),
      foraDoRaio,
    });
  }

  let valor = 0;

  for (const entrega of entregas) {
    valor += entrega.valor;
  }

  return {
    // Chave para saber se o frete ainda vale para o carrinho e o endereço atuais.
    chave: chaveFrete(itens, endereco),
    entregas,
    valor: Math.round(valor * 100) / 100,
    foraDoRaio: entregas.some((entrega) => entrega.foraDoRaio),
  };
}

export function chaveFrete(itens, endereco) {
  const feiras = feirasDoCarrinho(itens).map((feira) => feira.nome).join('|');
  return `${feiras}#${endereco.cep}#${endereco.logradouro}#${endereco.numero}#${endereco.cidade}`;
}

export function formatarDistancia(distancia) {
  return `${distancia.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}
