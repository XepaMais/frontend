import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { entrar } from '@/compartilhado/servicos/autenticacao';
import BotaoVoltar from '@/modulos/autenticacao/paginas/BotaoVoltar';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

function Crumb() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function fazerLogin(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    const formulario = new FormData(evento.currentTarget);

    try {
      const conta = await entrar({ email: formulario.get('email'), senha: formulario.get('senha') });
      // O plano é escolhido só no cadastro; o login vai direto para a área da conta.
      navigate(conta.tipo === 'FEIRANTE' ? '/homeF' : conta.tipo === 'CONSUMIDOR' ? '/homeU' : '/');
    } catch (erroApi) {
      setErro(erroApi.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className={Styles.container}>
      <section className={Styles.ladoImagem}></section>

      <section className={Styles.ladoForm}>
        <form className={Styles.form} onSubmit={fazerLogin}>
          <BotaoVoltar destino="/" />

          <h1>Entrar na conta</h1>

          <label htmlFor="email">Digite seu Email</label>
          <input type="email" id="email" name="email" required />

          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" name="senha" required />

          <button type="submit" className={Styles.btnEntrar} disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
          {erro && <p role="alert">{erro}</p>}

          <button type="button" className={Styles.btndemo} onClick={() => navigate('/demo')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M5 4a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5.263a1 1 0 1 1 2 0V19a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h5.017a1 1 0 1 1 0 2z" />
              <path d="M21.411 2.572a.963.963 0 0 1 0 1.36l-8.772 8.786a.96.96 0 0 1-1.358 0 .963.963 0 0 1 0-1.36l8.773-8.786a.96.96 0 0 1 1.357 0" />
              <path d="M21.04 2c.53 0 .96.43.96.962V8c0 .531-.47 1-1 1s-1-.469-1-1V4h-4c-.53 0-1-.469-1-1s.43-1 .96-1z" />
            </svg>
            Visite nosso Demo (Acesso rápido)
          </button>

          <p className={Styles.cadastro}>
            Ainda não tem conta? <Link to="/OpcaoLogin">Cadastre-se</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Crumb;
