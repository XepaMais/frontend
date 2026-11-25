// Despesas do feirante. Com login, ficam no banco (tb_despesa); no modo demonstração, neste navegador.
import { dataEmTexto, estaNaSemanaAtual, estaNoMesAtual } from '@/compartilhado/servicos/datas';
import { enviarJson, excluirNaApi, requisicaoApi } from '@/compartilhado/servicos/api';
import { caminhoFinanceiro, contaDoFeirante } from './financeiroApi.js';

const CHAVE_GASTOS = 'gastosFeirante';

export const CATEGORIAS_GASTO = [
  { valor: 'mercadoria', rotulo: 'Mercadoria', cor: '#104B2D' },
  { valor: 'ajudantes', rotulo: 'Ajudantes/funcionários', cor: '#27693A' },
  { valor: 'transporte', rotulo: 'Transporte', cor: '#3A8855' },
  { valor: 'combustivel', rotulo: 'Combustível', cor: '#9CBB06' },
  { valor: 'embalagens', rotulo: 'Embalagens e sacolas', cor: '#F5B400' },
  { valor: 'barraca', rotulo: 'Barraca e equipamentos', cor: '#FF8C00' },
  { valor: 'manutencao', rotulo: 'Manutenção', cor: '#FF5200' },
  { valor: 'taxas', rotulo: 'Taxas e licenças', cor: '#733000' },
  { valor: 'taxaXepa', rotulo: 'Taxa do Xepa+', cor: '#5C2D91' },
  { valor: 'alimentacao', rotulo: 'Alimentação', cor: '#B84A00' },
  { valor: 'outros', rotulo: 'Outras despesas', cor: '#161414' },
];

export function carregarGastos() {
  return JSON.parse(localStorage.getItem(CHAVE_GASTOS)) || [];
}

export function salvarGastos(gastos) {
  localStorage.setItem(CHAVE_GASTOS, JSON.stringify(gastos));
}

// ---------- Funções usadas pelas páginas (API com login, navegador sem login) ----------

function rotuloDaCategoria(valor) {
  const categoria = CATEGORIAS_GASTO.find((item) => item.valor === valor);

  return categoria ? categoria.rotulo : 'Outras despesas';
}

function valorDaCategoria(rotulo) {
  const categoria = CATEGORIAS_GASTO.find((item) => item.rotulo === rotulo);

  return categoria ? categoria.valor : 'outros';
}

// Despesa da API -> formato usado nas telas. O horário evita que a data mude de dia por causa do fuso.
function despesaDaApi(despesa) {
  return {
    id: despesa.id,
    descricao: despesa.descricao,
    quantidade: Number(despesa.quantidade),
    valorUnitario: Number(despesa.valorUnitario),
    categoria: valorDaCategoria(despesa.categoria),
    feira: despesa.feira || '',
    data: `${despesa.data}T12:00:00`,
    pedido: despesa.pedido,
  };
}

function despesaParaApi(dados, data) {
  return {
    descricao: dados.descricao,
    quantidade: dados.quantidade,
    valorUnitario: dados.valorUnitario,
    categoria: rotuloDaCategoria(dados.categoria),
    data: data ? dataEmTexto(new Date(data)) : undefined,
  };
}

export async function listarGastos() {
  const conta = contaDoFeirante();
  if (!conta) return carregarGastos();

  const despesas = await requisicaoApi(caminhoFinanceiro(conta, '/despesas'));
  return despesas.map(despesaDaApi);
}

// dados: { descricao, quantidade, valorUnitario, categoria, feira }. Devolve o gasto salvo.
export async function criarGasto(dados) {
  const conta = contaDoFeirante();

  if (!conta) {
    const gastos = carregarGastos();
    const maiorId = gastos.reduce((maior, gasto) => Math.max(maior, gasto.id), 0);
    const novo = { id: maiorId + 1, data: new Date(), ...dados };
    salvarGastos([novo, ...gastos]);
    return novo;
  }

  const salva = await enviarJson(caminhoFinanceiro(conta, '/despesas'), despesaParaApi(dados));
  return despesaDaApi(salva);
}

export async function atualizarGasto(gasto, dados) {
  const conta = contaDoFeirante();

  if (!conta) {
    const atualizado = { ...gasto, ...dados };
    salvarGastos(carregarGastos().map((item) => (item.id === gasto.id ? atualizado : item)));
    return atualizado;
  }

  const salva = await enviarJson(
    caminhoFinanceiro(conta, `/despesas/${gasto.id}`),
    despesaParaApi(dados, gasto.data),
    'PUT',
  );
  return despesaDaApi(salva);
}

export async function removerGasto(gasto) {
  const conta = contaDoFeirante();

  if (!conta) {
    salvarGastos(carregarGastos().filter((item) => item.id !== gasto.id));
    return;
  }

  await excluirNaApi(caminhoFinanceiro(conta, `/despesas/${gasto.id}`));
}

// Lança a comissão do Xepa+ de um pedido como despesa (uma vez por pedido).
// Usado só no modo demonstração, em que os pedidos ainda ficam no navegador.
export function registrarTaxaDoPedido(pedido, valorTaxa, percentual) {
  const gastos = carregarGastos();

  if (gastos.some((gasto) => gasto.pedido === pedido.numero)) return;

  const maiorId = gastos.reduce((maior, gasto) => Math.max(maior, gasto.id), 0);

  salvarGastos([
    {
      id: maiorId + 1,
      descricao: `Taxa Xepa+ (${percentual}%) - Pedido nº ${pedido.numero}`,
      quantidade: 1,
      valorUnitario: valorTaxa,
      categoria: 'taxaXepa',
      feira: pedido.itens[0]?.retirada || '',
      data: new Date(pedido.data),
      pedido: pedido.numero,
    },
    ...gastos,
  ]);
}

function somarGastos(gastos) {
  let soma = 0;

  for (const gasto of gastos) {
    soma += gasto.quantidade * gasto.valorUnitario;
  }

  return soma;
}

function filtrarGastosDoMes(gastos) {
  return gastos.filter((gasto) => estaNoMesAtual(new Date(gasto.data)));
}

export function somarGastosDaSemana(gastos) {
  return somarGastos(gastos.filter((gasto) => estaNaSemanaAtual(new Date(gasto.data))));
}

// Soma os gastos do mês atual por categoria. Só entram no gráfico as categorias usadas.
export function gastosDoMesPorCategoria(gastos) {
  const gastosDoMes = filtrarGastosDoMes(gastos);
  const resultado = [];

  for (const categoria of CATEGORIAS_GASTO) {
    const gastosDaCategoria = gastosDoMes.filter((gasto) => gasto.categoria === categoria.valor);
    const valor = somarGastos(gastosDaCategoria);

    if (valor > 0) {
      resultado.push({ rotulo: categoria.rotulo, cor: categoria.cor, valor });
    }
  }

  return resultado;
}

export function calcularTotaisDeGastos(gastos) {
  const hoje = new Date().toDateString();
  const gastosDeHoje = gastos.filter((gasto) => new Date(gasto.data).toDateString() === hoje);

  return {
    hoje: somarGastos(gastosDeHoje),
    semana: somarGastosDaSemana(gastos),
    mes: somarGastos(filtrarGastosDoMes(gastos)),
  };
}
