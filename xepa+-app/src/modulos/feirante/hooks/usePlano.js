import { useEffect, useState } from 'react';
import {
  carregarPlanoSelecionado,
  planoLiberaRecurso,
  sincronizarPlano,
  EVENTO_PLANO,
} from '@/modulos/feirante/servicos/planoFeirante';

// Busca o plano na API uma vez por carregamento da página (vários componentes usam o hook).
let sincronizado = false;

// Mantém o menu e as páginas iguais ao plano escolhido, mesmo quando ele muda.
export default function usePlano() {
  const [plano, setPlano] = useState(carregarPlanoSelecionado);

  useEffect(() => {
    function atualizar() {
      setPlano(carregarPlanoSelecionado());
    }

    window.addEventListener(EVENTO_PLANO, atualizar);
    if (!sincronizado) {
      sincronizado = true;
      sincronizarPlano();
    }
    return () => window.removeEventListener(EVENTO_PLANO, atualizar);
  }, []);

  return {
    plano,
    temAcesso: (recurso) => planoLiberaRecurso(plano, recurso),
  };
}
