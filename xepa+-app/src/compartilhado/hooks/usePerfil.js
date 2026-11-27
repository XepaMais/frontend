import { useEffect, useState } from 'react';
import {
  carregarPerfil,
  salvarPerfil,
  sincronizarPerfil,
  EVENTO_PERFIL,
} from '@/compartilhado/servicos/perfil';

// Busca o perfil na API uma vez por carregamento da página (vários componentes usam o hook).
const sincronizados = new Set();

export default function usePerfil(tipo) {
  const [perfil, setPerfil] = useState(() => carregarPerfil(tipo));

  useEffect(() => {
    function atualizar() {
      setPerfil(carregarPerfil(tipo));
    }

    window.addEventListener(EVENTO_PERFIL, atualizar);
    if (!sincronizados.has(tipo)) {
      sincronizados.add(tipo);
      sincronizarPerfil(tipo);
    }
    return () => window.removeEventListener(EVENTO_PERFIL, atualizar);
  }, [tipo]);

  return {
    perfil,
    primeiroNome: perfil.nome.trim().split(' ')[0],
    salvar: (dados) => salvarPerfil(tipo, dados),
  };
}
