import { useEffect, useState } from 'react';
import {
  listarRendas,
  removerRenda,
  salvarRenda,
} from '@/modulos/feirante/servicos/lancamentosFinanceiros';
import { listarGastos, somarGastosDaSemana } from '@/modulos/feirante/servicos/gastosFeirante';
import { dataDeHoje, estaNaSemanaAtual, estaNoMesAtual } from '@/compartilhado/servicos/datas';

// Soma os lançamentos de um tipo: 'renda' ou 'compra'.
function total(lista, tipoLancamento) {
  let soma = 0;

  for (const item of lista) {
    if (item.tipo === tipoLancamento) {
      soma += Number(item.valor);
    }
  }

  return soma;
}

// O horário evita que a data mude de dia por causa do fuso.
function lerData(item) {
  return new Date(item.data + 'T12:00:00');
}

// Rendas e gastos do feirante: do backend (com login) ou deste navegador (demonstração).
export default function useFinanceiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let ativo = true;

    Promise.all([listarRendas(), listarGastos()])
      .then(([rendas, listaGastos]) => {
        if (!ativo) return;
        setLancamentos(rendas);
        setGastos(listaGastos);
      })
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, []);

  const hoje = dataDeHoje();
  const doDia = lancamentos.filter((item) => item.data === hoje);
  const daSemana = lancamentos.filter((item) => estaNaSemanaAtual(lerData(item)));
  const doMes = lancamentos.filter((item) => estaNoMesAtual(lerData(item)));

  // Custos da semana: gastos cadastrados na página de Gastos + compras antigas já registradas.
  const custosDaSemana = somarGastosDaSemana(gastos) + total(daSemana, 'compra');

  // Adiciona a renda nova ou substitui a que está sendo editada.
  async function salvarLancamento(lancamento) {
    const jaExiste = lancamentos.some((item) => item.id === lancamento.id);
    const salvo = await salvarRenda(lancamento, jaExiste);

    setLancamentos((atuais) => (
      jaExiste
        ? atuais.map((item) => (item.id === lancamento.id ? salvo : item))
        : [...atuais, salvo]
    ));
  }

  async function excluirLancamento(id) {
    await removerRenda(id);
    setLancamentos((atuais) => atuais.filter((item) => item.id !== id));
  }

  return {
    lancamentos,
    gastos,
    carregando,
    erro,
    salvarLancamento,
    excluirLancamento,
    custosDaSemana,
    doDia,
    daSemana,
    doMes,
    total,
  };
}
