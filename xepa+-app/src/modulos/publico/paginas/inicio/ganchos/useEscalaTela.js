import { useEffect } from 'react';

// Medidas para as quais as seções foram desenhadas no computador
const ALTURA_BASE = 650;
const LARGURA_BASE = 1366;
const ESCALA_MAXIMA = 1.6;

/* Em monitores maiores, calcula quanto as seções crescem (--escala-tela). */
export default function useEscalaTela() {
  useEffect(() => {
    const raiz = document.documentElement;

    function atualizar() {
      // As seções depois da primeira ocupam a janela inteira (o cabeçalho já saiu da tela)
      const escala = Math.min(
        window.innerHeight / ALTURA_BASE,
        window.innerWidth / LARGURA_BASE,
        ESCALA_MAXIMA,
      );
      raiz.style.setProperty('--escala-tela', Math.max(1, escala).toFixed(3));
    }

    atualizar();
    window.addEventListener('resize', atualizar);

    return () => {
      window.removeEventListener('resize', atualizar);
      raiz.style.removeProperty('--escala-tela');
    };
  }, []);
}
