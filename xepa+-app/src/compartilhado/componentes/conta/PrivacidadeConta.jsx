import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/compartilhado/componentes/modal/Modal';
import estiloModal from '@/compartilhado/componentes/modal/Modal.module.css';
import base from '@/compartilhado/estilos/conta.module.css';
import { enviarJson, requisicaoApi } from '@/compartilhado/servicos/api';
import { carregarContaDaSessao, encerrarSessao } from '@/compartilhado/servicos/autenticacao';

// LGPD (art. 18): a pessoa baixa os próprios dados, muda o consentimento de e-mail e exclui a conta.
// Só funciona com uma conta de verdade (no modo demonstração não há dados na API).
function PrivacidadeConta() {
  const navigate = useNavigate();
  const conta = carregarContaDaSessao();
  const logada = Boolean(conta?.token);
  const [consentimento, setConsentimento] = useState(null);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!logada) return;
    requisicaoApi(`/conta/${conta.id}/consentimento`)
      .then(setConsentimento)
      .catch((falha) => setErro(falha.message));
  }, [logada, conta?.id]);

  async function baixarDados() {
    setErro('');
    setMensagem('');
    try {
      const dados = await requisicaoApi(`/conta/${conta.id}/dados`);
      const arquivo = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(arquivo);
      link.download = 'meus-dados-xepamais.json';
      link.click();
      URL.revokeObjectURL(link.href);
      setMensagem('Arquivo com os seus dados baixado.');
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function alterarMarketing(evento) {
    setErro('');
    setMensagem('');
    try {
      const novo = await enviarJson(`/conta/${conta.id}/consentimento`,
        { aceiteMarketing: evento.target.checked }, 'PUT');
      setConsentimento(novo);
      setMensagem(novo.aceiteMarketing ? 'Você vai receber novidades por e-mail.' : 'Você não vai mais receber novidades por e-mail.');
    } catch (falha) {
      setErro(falha.message);
    }
  }

  if (!logada) {
    return (
      <>
        <h2 className={base.tituloSecao}>Privacidade e dados</h2>
        <section className={base.card}>
          <div className={base.corpo}>
            <p>Entre com a sua conta para baixar os seus dados ou excluir a conta.</p>
          </div>
        </section>
      </>
    );
  }

  const aceiteEm = consentimento?.aceiteTermosEm
    ? new Date(consentimento.aceiteTermosEm).toLocaleString('pt-BR')
    : 'Não registrado (conta criada antes do registro de aceite)';

  return (
    <>
      <h2 className={base.tituloSecao}>Privacidade e dados</h2>

      <section className={base.card} aria-labelledby="titulo-privacidade">
        <div className={base.corpo}>
          <p id="titulo-privacidade">
            Seus direitos pela LGPD: ver e baixar os seus dados, mudar o consentimento e excluir a conta.
          </p>

          {erro && <p role="alert" style={{ color: '#c0392b' }}>{erro}</p>}
          {mensagem && <p className={base.sucesso} role="status">{mensagem}</p>}

          <div className={base.linhaDado}>
            <span className={base.rotuloDado}>Termos aceitos em</span>
            <span className={base.valorDado}>
              {aceiteEm}{consentimento?.versaoTermos ? ` (versão ${consentimento.versaoTermos})` : ''}
            </span>
          </div>

          <div className={base.linhaDado}>
            <label className={base.rotuloDado} htmlFor="aceite-marketing">Novidades por e-mail</label>
            <input
              id="aceite-marketing"
              type="checkbox"
              checked={Boolean(consentimento?.aceiteMarketing)}
              onChange={alterarMarketing}
              disabled={!consentimento}
            />
          </div>

          <div className={base.acoes}>
            <button type="button" className={base.botaoSecundario} onClick={baixarDados}>
              Baixar meus dados
            </button>
            <button type="button" className={base.botaoPerigoContorno} onClick={() => setExcluindo(true)}>
              Excluir minha conta
            </button>
          </div>
        </div>
      </section>

      {excluindo && (
        <PopUpExcluirConta
          idConta={conta.id}
          aoFechar={() => setExcluindo(false)}
          aoExcluir={() => {
            encerrarSessao();
            navigate('/', { replace: true });
          }}
        />
      )}
    </>
  );
}

function PopUpExcluirConta({ idConta, aoFechar, aoExcluir }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await requisicaoApi(`/conta/${idConta}`, { method: 'DELETE', body: JSON.stringify({ senha }) });
      aoExcluir();
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <Modal titulo="Excluir a sua conta?" aoFechar={aoFechar}>
      <form className={estiloModal.form} onSubmit={confirmar}>
        <p className={estiloModal.descricao}>
          Seus dados pessoais (nome, e-mail, CPF, telefone, endereço e foto) serão apagados e você sairá de
          todos os aparelhos. Pedidos e pagamentos continuam guardados sem identificar você, como exige a lei
          fiscal. Essa ação não pode ser desfeita.
        </p>
        <div className={estiloModal.campo}>
          <label htmlFor="senha-exclusao">Digite sua senha para confirmar</label>
          <input
            id="senha-exclusao"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            required
          />
        </div>

        {erro && <p className={estiloModal.erro} role="alert">{erro}</p>}

        <div className={estiloModal.acoes}>
          <button type="button" className={estiloModal.secundario} onClick={aoFechar}>
            Voltar
          </button>
          <button type="submit" className={estiloModal.perigo} disabled={enviando || !senha}>
            {enviando ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PrivacidadeConta;
