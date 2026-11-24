// Junta os registros que já existem (rendas, compras e gastos) em uma única lista.
// Com login, a lista e a planilha vêm do backend; sem login, deste navegador.
import { dataEmTexto, formatarData } from '@/compartilhado/servicos/datas';
import { baixarArquivoDaApi, requisicaoApi, salvarArquivo } from '@/compartilhado/servicos/api';
import { carregarLancamentosFinanceiros } from './lancamentosFinanceiros.js';
import { carregarGastos, CATEGORIAS_GASTO } from './gastosFeirante.js';
import { caminhoFinanceiro, contaDoFeirante, parametros } from './financeiroApi.js';

export const FILTROS_VAZIOS = {
  inicio: '',
  fim: '',
  tipo: 'todos',
  categoria: '',
  busca: '',
};

export const ROTULOS_TIPO = { lucro: 'Lucro', gasto: 'Despesa' };

function rotuloCategoriaGasto(valor) {
  const categoria = CATEGORIAS_GASTO.find((item) => item.valor === valor);

  return categoria ? categoria.rotulo : 'Outras despesas';
}

function categoriaDoLancamento(item) {
  if (item.categoria) return item.categoria;

  return item.tipo === 'renda' ? 'Renda' : 'Outros';
}

export function carregarHistoricoFinanceiro() {
  const lancamentos = carregarLancamentosFinanceiros().map((item) => ({
    id: `lancamento-${item.id}`,
    data: item.data,
    descricao: item.descricao,
    categoria: categoriaDoLancamento(item),
    tipo: item.tipo === 'renda' ? 'lucro' : 'gasto',
    valor: Number(item.valor),
    feira: item.feira || '',
  }));

  const gastos = carregarGastos().map((item) => ({
    id: `gasto-${item.id}`,
    data: dataEmTexto(new Date(item.data)),
    descricao: item.descricao,
    categoria: rotuloCategoriaGasto(item.categoria),
    tipo: 'gasto',
    valor: item.quantidade * item.valorUnitario,
    feira: item.feira || '',
  }));

  return [...lancamentos, ...gastos].sort((a, b) => b.data.localeCompare(a.data));
}

export async function listarHistoricoFinanceiro() {
  const conta = contaDoFeirante();
  if (!conta) return carregarHistoricoFinanceiro();

  const historico = await requisicaoApi(caminhoFinanceiro(conta, '/historico'));
  return historico.registros.map((registro) => ({
    ...registro,
    valor: Number(registro.valor),
    feira: registro.feira || '',
  }));
}

const NOME_PLANILHA = 'historico-financeiro.csv';
const BOM = String.fromCharCode(0xfeff);
const QUEBRA_LINHA = String.fromCharCode(13, 10);

// Planilha no formato do Excel em português (";" e vírgula decimal). Com login, gerada pelo backend.
export async function baixarPlanilha({ filtros, registros, totais, nomeFeirante }) {
  const conta = contaDoFeirante();

  if (conta) {
    const filtrosApi = {
      inicio: filtros.inicio,
      fim: filtros.fim,
      tipo: filtros.tipo,
      categoria: filtros.categoria,
      busca: filtros.busca.trim(),
    };
    await baixarArquivoDaApi(caminhoFinanceiro(conta, `/planilha${parametros(filtrosApi)}`), NOME_PLANILHA);
    return;
  }

  salvarArquivo(
    new Blob([montarCsv({ registros, totais, nomeFeirante })], { type: 'text/csv;charset=utf-8' }),
    NOME_PLANILHA,
  );
}

function campoCsv(valor) {
  let texto = String(valor ?? '');
  // Impede que o Excel trate o texto como fórmula.
  if (/^[=+\-@\t\r]/.test(texto) && !/^-?\d+(,\d+)?$/.test(texto)) texto = `'${texto}`;
  if (/[;"\r\n]/.test(texto)) texto = `"${texto.replace(/"/g, '""')}"`;
  return texto;
}

function numeroCsv(valor) {
  return Number(valor).toFixed(2).replace('.', ',');
}

function montarCsv({ registros, totais, nomeFeirante }) {
  const linhas = [
    ['Histórico financeiro - Xepa+'],
    ['Feirante', nomeFeirante],
    [],
    ['Data', 'Descrição', 'Categoria', 'Tipo', 'Feira', 'Valor (R$)'],
    ...registros.map((registro) => [
      formatarData(registro.data),
      registro.descricao,
      registro.categoria,
      ROTULOS_TIPO[registro.tipo],
      registro.feira,
      numeroCsv(registro.valor),
    ]),
    [],
    ['Total de lucros', '', '', '', '', numeroCsv(totais.lucros)],
    ['Total de despesas', '', '', '', '', numeroCsv(totais.gastos)],
    ['Saldo do período', '', '', '', '', numeroCsv(totais.saldo)],
  ];

  // O BOM faz o Excel abrir os acentos corretamente.
  return BOM + linhas.map((linha) => linha.map(campoCsv).join(';')).join(QUEBRA_LINHA);
}

function passaNosFiltros(registro, filtros) {
  const busca = filtros.busca.trim().toLocaleLowerCase('pt-BR');
  const descricao = registro.descricao.toLocaleLowerCase('pt-BR');

  if (filtros.inicio && registro.data < filtros.inicio) return false;
  if (filtros.fim && registro.data > filtros.fim) return false;
  if (filtros.tipo !== 'todos' && registro.tipo !== filtros.tipo) return false;
  if (filtros.categoria && registro.categoria !== filtros.categoria) return false;

  return descricao.includes(busca);
}

export function filtrarHistorico(registros, filtros) {
  return registros.filter((registro) => passaNosFiltros(registro, filtros));
}

export function calcularTotais(registros) {
  let lucros = 0;
  let gastos = 0;

  for (const registro of registros) {
    if (registro.tipo === 'lucro') lucros += registro.valor;
    if (registro.tipo === 'gasto') gastos += registro.valor;
  }

  return { lucros, gastos, saldo: lucros - gastos };
}

export function descreverPeriodo(filtros) {
  const { inicio, fim } = filtros;

  if (inicio && fim) return `${formatarData(inicio)} a ${formatarData(fim)}`;
  if (inicio) return `A partir de ${formatarData(inicio)}`;
  if (fim) return `Até ${formatarData(fim)}`;

  return 'Todo o período';
}
