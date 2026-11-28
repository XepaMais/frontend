import { Link } from 'react-router-dom';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

// Caixa obrigatória de aceite dos Termos de uso e das Diretrizes de Privacidade.
// Os links abrem em outra aba para a pessoa não perder o que já preencheu.
function AceiteTermos() {
  return (
    <label className={Styles.termos}>
      <input type="checkbox" name="aceiteTermos" required />
      <span>
        Li e aceito os{' '}
        <Link to="/termos-de-uso" target="_blank" rel="noopener noreferrer">
          Termos de uso
        </Link>{' '}
        e as{' '}
        <Link to="/privacidade" target="_blank" rel="noopener noreferrer">
          Diretrizes de Privacidade
        </Link>{' '}
        do Xepa+.
      </span>
    </label>
  );
}

export default AceiteTermos;
