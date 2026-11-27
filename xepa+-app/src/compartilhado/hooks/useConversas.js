import { useEffect, useState } from 'react';
import {
  carregarConversas,
  carregarConversasDoFeirante,
  EVENTO_CONVERSAS,
  sincronizarConversas,
} from '@/compartilhado/servicos/conversas';

// De quanto em quanto tempo a tela busca mensagens novas na API (conta logada).
const INTERVALO_MS = 15000;

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

    // Conta logada: traz as conversas da API agora e de tempos em tempos (mensagens do outro lado).
    sincronizarConversas();
    const relogio = setInterval(() => {
      if (document.visibilityState === 'visible') sincronizarConversas();
    }, INTERVALO_MS);

    return () => {
      window.removeEventListener(EVENTO_CONVERSAS, atualizar);
      window.removeEventListener('storage', atualizar);
      clearInterval(relogio);
    };
  }, [carregar]);

  return conversas;
}
