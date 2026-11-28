import { Link } from 'react-router-dom';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

// LGPD: aceite obrigatório dos Termos de uso e das Diretrizes de Privacidade (a API grava a data e a versão)
// e consentimento opcional para receber novidades, que pode ser retirado depois no perfil.
// Os links abrem em outra aba para a pessoa não perder o que já preencheu.
function AceiteTermos() {
  return (
    <>
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
          do Xepa+. (obrigatório)
        </span>
      </label>
      <label className={Styles.termos}>
        <input type="checkbox" name="aceiteMarketing" />
        <span>Quero receber novidades e ofertas do Xepa+ por e-mail. (opcional)</span>
      </label>
    </>
  );
}

// Lê as duas caixas do formulário no formato que a API espera.
// eslint-disable-next-line react-refresh/only-export-components
export function consentimentoDoFormulario(formulario) {
  return {
    aceiteTermos: formulario.get('aceiteTermos') === 'on',
    aceiteMarketing: formulario.get('aceiteMarketing') === 'on',
  };
}

export default AceiteTermos;
