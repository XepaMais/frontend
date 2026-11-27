import { useEffect, useState } from 'react';
import {
  carregarCarrinho,
  contarItens,
  montarItensCarrinho,
  EVENTO_CARRINHO,
  sincronizarCarrinho,
} from '@/modulos/usuario/servicos/carrinho';
import { EVENTO_XEPAS } from '@/compartilhado/servicos/xepas';

// Busca o carrinho da API uma vez por carregamento da página (vários componentes usam o hook).
let sincronizado = false;

// Mantém o cabeçalho, os cards e a página do carrinho sempre iguais.
export default function useCarrinho() {
  const [itens, setItens] = useState(carregarCarrinho);

  useEffect(() => {
    function atualizar() {
      setItens(carregarCarrinho());
    }

    window.addEventListener(EVENTO_CARRINHO, atualizar);
    // Quando a vitrine chega da API, os itens do carrinho ganham preço/estoque atualizados.
    window.addEventListener(EVENTO_XEPAS, atualizar);
    if (!sincronizado) {
      sincronizado = true;
      sincronizarCarrinho();
    }

    return () => {
      window.removeEventListener(EVENTO_CARRINHO, atualizar);
      window.removeEventListener(EVENTO_XEPAS, atualizar);
    };
  }, []);

  const itensDetalhados = montarItensCarrinho(itens);

  return {
    itens: itensDetalhados,
    estaNoCarrinho: (id) => itensDetalhados.some((item) => item.id === id),
    totalItens: contarItens(itensDetalhados),
  };
}
