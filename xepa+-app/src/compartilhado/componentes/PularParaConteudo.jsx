// Primeiro item do teclado (Tab): pula o menu e leva direto ao conteúdo principal (<main>) da página.
// Fica escondido e aparece quando recebe o foco.
function PularParaConteudo() {
  function pular(evento) {
    const principal = document.querySelector('main');
    if (!principal) return;
    evento.preventDefault();
    if (!principal.hasAttribute('tabindex')) principal.setAttribute('tabindex', '-1');
    principal.focus();
    principal.scrollIntoView();
  }

  return (
    <a href="#conteudo" className="pular-conteudo" onClick={pular}>
      Pular para o conteúdo
    </a>
  );
}

export default PularParaConteudo;
