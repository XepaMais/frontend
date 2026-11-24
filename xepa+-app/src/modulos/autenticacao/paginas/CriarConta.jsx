import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cadastrarConsumidor } from '@/compartilhado/servicos/autenticacao';
import AceiteTermos from '@/modulos/autenticacao/paginas/AceiteTermos';
import BotaoVoltar from '@/modulos/autenticacao/paginas/BotaoVoltar';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

function CriarConta() {
  const navigate = useNavigate();
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function cadastrar(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    const formulario = new FormData(evento.currentTarget);
    const dados = Object.fromEntries(['nome', 'cpf', 'telefone', 'email', 'senha']
      .map((campo) => [campo, formulario.get(campo)]));

    try {
      await cadastrarConsumidor(dados);
      navigate('/Crumb', { state: { mensagem: 'Conta criada. Entre com seu email e senha.' } });
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
        <form className={Styles.form} onSubmit={cadastrar}>
          <h1>Crie sua conta</h1>

          <div className={Styles.campo}>
            <label htmlFor="nome">Nome completo</label>
            <input type="text" id="nome" name="nome" required />
          </div>

          <div className={Styles.linha}>
            <div className={Styles.campo}>
              <label htmlFor="cpf">CPF</label>
              <input type="text" id="cpf" name="cpf" inputMode="numeric" required />
            </div>
            <div className={Styles.campo}>
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" id="telefone" name="telefone" required />
            </div>
          </div>

          <div className={Styles.campo}>
            <label htmlFor="nascimento">Data de Nascimento</label>
            <input type="date" id="nascimento" name="nascimento" required />
          </div>

          <div className={Styles.campo}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className={Styles.campo}>
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" required />
          </div>

          <AceiteTermos />

          <button type="submit" className={Styles.btnEntrar} disabled={carregando}>
            {carregando ? 'Salvando...' : 'Criar conta'}
          </button>
          {erro && <p role="alert">{erro}</p>}

          <p className={Styles.cadastro}>
            Já tem conta? <Link to="/Crumb">Entrar</Link>
          </p>
        </form>
      </section>

      {contaCriada && (
        <Modal titulo="Conta criada!" aoFechar={irParaLogin}>
          <p className={estiloModal.descricao}>
            <CircleCheck
              size={20}
              aria-hidden="true"
              style={{ verticalAlign: 'text-bottom', marginRight: 6 }}
            />
            Sua conta de consumidor foi criada com sucesso. Entre com o seu e-mail e senha para
            começar a encontrar xepas perto de você.
          </p>

          <div className={estiloModal.acoes}>
            <button type="button" className={estiloModal.principal} onClick={irParaLogin}>
              Ir para o login
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default CriarConta;
