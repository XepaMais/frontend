import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cadastrarFeirante } from '@/compartilhado/servicos/autenticacao';
import AceiteTermos from '@/modulos/autenticacao/paginas/AceiteTermos';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

function CriarContaF() {
  const navigate = useNavigate();
  const location = useLocation();
  const dadosConta = location.state;
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function proximaEtapa(evento) {
    evento.preventDefault();
    setErro('');
    setCarregando(true);
    const formulario = new FormData(evento.currentTarget);
    const cadastro = Object.fromEntries(
      ['nome', 'cpf', 'telefone', 'email', 'senha'].map((campo) => [campo, dadosConta?.[campo] || '']),
    );
    cadastro.nomeFantasia = formulario.get('fantasia');
    cadastro.cnpj = formulario.get('cnpj');
    cadastro.ccm = formulario.get('ccm');
    cadastro.matricula = formulario.get('matricula');
    cadastro.grupoComercio = formulario.get('grupo');

    try {
      if (!cadastro.email) throw new Error('Volte à etapa anterior e preencha os dados da conta.');
      await cadastrarFeirante(cadastro);
      navigate('/Crumb', { state: { mensagem: 'Cadastro concluído. Entre com seu email e senha.' } });
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
        <form className={Styles.form} onSubmit={proximaEtapa}>
          <h1>Cadastre sua conta</h1>

          <div className={Styles.linha}>
            <div className={Styles.campo}>
              <label htmlFor="matricula">Matrícula</label>
              <input type="text" id="matricula" name="matricula" required />
            </div>
            <div className={Styles.campo}>
              <label htmlFor="validade">Validade</label>
              <input type="text" id="validade" name="validade" required />
            </div>
          </div>

          <div className={Styles.linha}>
            <div className={Styles.campo}>
              <label htmlFor="cnpj">CNPJ</label>
              <input type="text" id="cnpj" name="cnpj" inputMode="numeric" required />
            </div>
            <div className={Styles.campo}>
              <label htmlFor="ccm">CCM</label>
              <input type="text" id="ccm" name="ccm" required />
            </div>
          </div>

          <div className={Styles.campo}>
            <label htmlFor="titular">Titular</label>
            <input type="text" id="titular" name="titular" required />
          </div>

          <div className={Styles.campo}>
            <label htmlFor="fantasia">Nome Fantasia</label>
            <input type="text" id="fantasia" name="fantasia" required />
          </div>

          <div className={Styles.campo}>
            <label htmlFor="grupo">Grupo de Comércio</label>
            <input type="text" id="grupo" name="grupo" required />
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
    </main>
  );
}

export default CriarContaF;
