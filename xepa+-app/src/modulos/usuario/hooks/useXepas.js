import { useEffect, useState } from 'react';
import {
  carregarXepasDisponiveis,
  EVENTO_XEPAS,
  sincronizarXepas,
} from '@/compartilhado/servicos/xepas';

// Vitrine do consumidor: mostra a cópia local na hora e atualiza com a API ao abrir a tela.
export default function useXepas() {
  const [xepas, setXepas] = useState(carregarXepasDisponiveis);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    const atualizar = () => setXepas(carregarXepasDisponiveis());

    window.addEventListener(EVENTO_XEPAS, atualizar);
    sincronizarXepas().finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => {
      ativo = false;
      window.removeEventListener(EVENTO_XEPAS, atualizar);
    };
  }, []);

  return { xepas, carregando };
}
