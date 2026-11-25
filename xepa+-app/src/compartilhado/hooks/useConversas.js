import { useEffect, useState } from 'react';
import {
  carregarConversas,
  carregarConversasDoFeirante,
  EVENTO_CONVERSAS,
} from '@/compartilhado/servicos/conversas';

// perfil 'feirante': só as conversas do feirante logado; senão, todas (consumidor).
export default function useConversas(perfil) {
  const carregar = perfil === 'feirante' ? carregarConversasDoFeirante : carregarConversas;
  const [conversas, setConversas] = useState(carregar);

  useEffect(() => {
    function atualizar() {
      setConversas(carregar());
    }

    window.addEventListener(EVENTO_CONVERSAS, atualizar);
    window.addEventListener('storage', atualizar);

    return () => {
      window.removeEventListener(EVENTO_CONVERSAS, atualizar);
      window.removeEventListener('storage', atualizar);
    };
  }, [carregar]);

  return conversas;
}
