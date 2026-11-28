import { Link } from 'react-router-dom';
import styles from './PaginaNaoEncontrada.module.css';

// Endereço que não existe: avisa a pessoa e oferece caminhos, em vez de mostrar outra página no lugar.
function PaginaNaoEncontrada() {
  return (
    <main className={styles.pagina}>
      <p className={styles.codigo} aria-hidden="true">404</p>
      <h1 className={styles.titulo}>Página não encontrada</h1>
      <p className={styles.texto}>
        O endereço pode ter sido digitado errado ou a página mudou de lugar.
      </p>
      <div className={styles.acoes}>
        <Link to="/" className={styles.principal}>Voltar ao início</Link>
        <Link to="/mapa-home" className={styles.secundario}>Ver feiras no mapa</Link>
        <Link to="/suporte" className={styles.secundario}>Falar com o suporte</Link>
      </div>
    </main>
  );
}

export default PaginaNaoEncontrada;
