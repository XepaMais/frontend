import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import Modal from '@/compartilhado/componentes/modal/Modal';
import estiloModal from '@/compartilhado/componentes/modal/Modal.module.css';
import base from '@/compartilhado/estilos/conta.module.css';
import { excluirNaApi, requisicaoApi } from '@/compartilhado/servicos/api';
import { carregarContaDaSessao, encerrarSessao } from '@/compartilhado/servicos/autenticacao';
import { formatarDataHora } from '@/compartilhado/servicos/pedidos';
import styles from './DispositivosConectados.module.css';

const ICONES = { computador: Monitor, celular: Smartphone, tablet: Tablet };

// Modo demonstração: lê do navegador apenas o que ele informa sobre o próprio aparelho.
function identificarDispositivoAtual() {
  const agente = navigator.userAgent;

  let sistema = 'Sistema não identificado';
  let tipo = 'computador';

  if (agente.includes('iPad')) {
    sistema = 'iPad';
    tipo = 'tablet';
  } else if (agente.includes('iPhone')) {
    sistema = 'iPhone';
    tipo = 'celular';
  } else if (agente.includes('Android')) {
    sistema = 'Android';
    tipo = agente.includes('Mobile') ? 'celular' : 'tablet';
  } else if (agente.includes('Windows')) {
    sistema = 'Windows';
  } else if (agente.includes('Mac OS')) {
    sistema = 'macOS';
  } else if (agente.includes('Linux')) {
    sistema = 'Linux';
  }

  let navegador = 'Navegador não identificado';

  if (agente.includes('Edg/')) {
    navegador = 'Microsoft Edge';
  } else if (agente.includes('OPR/')) {
    navegador = 'Opera';
  } else if (agente.includes('Firefox/')) {
    navegador = 'Firefox';
  } else if (agente.includes('Chrome/')) {
    navegador = 'Google Chrome';
  } else if (agente.includes('Safari/')) {
    navegador = 'Safari';
  }

  return { id: 'atual', nome: sistema, navegador, tipo, atual: true, ultimoAcesso: null };
}

function textoUltimoAcesso(dispositivo) {
  if (dispositivo.atual || !dispositivo.ultimoAcesso) return 'Último acesso: agora';
  return `Último acesso: ${formatarDataHora(dispositivo.ultimoAcesso)}`;
}

// Conta logada: aparelhos com login ativo vêm da API (/api/conta/{idConta}/dispositivos).
// Desconectar um aparelho encerra o login dele na hora; desconectar este é o mesmo que sair.
function DispositivosConectados() {
  const navigate = useNavigate();
  const conta = carregarContaDaSessao();
  const idConta = conta?.token ? conta.id : null;
  const [dispositivos, setDispositivos] = useState(() => (idConta ? [] : [identificarDispositivoAtual()]));
  const [carregando, setCarregando] = useState(Boolean(idConta));
  const [erro, setErro] = useState('');
  const [selecionado, setSelecionado] = useState(null);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);

  useEffect(() => {
    if (!idConta) return undefined;

    let ativo = true;
    requisicaoApi(`/conta/${idConta}/dispositivos`)
      .then((lista) => ativo && setDispositivos(lista))
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [idConta]);

  function sairDesteAparelho() {
    encerrarSessao();
    navigate('/');
  }

  async function desconectar(dispositivo) {
    setSelecionado(null);
    if (!idConta || dispositivo.atual) {
      sairDesteAparelho();
      return;
    }

    try {
      await excluirNaApi(`/conta/${idConta}/dispositivos/${dispositivo.id}`);
      setDispositivos((atuais) => atuais.filter((item) => item.id !== dispositivo.id));
    } catch (falha) {
      setErro(falha.message);
    }
  }

  async function desconectarOutros() {
    setConfirmandoTodos(false);
    try {
      await excluirNaApi(`/conta/${idConta}/dispositivos`);
      setDispositivos((atuais) => atuais.filter((item) => item.atual));
    } catch (falha) {
      setErro(falha.message);
    }
  }

  const outros = dispositivos.filter((item) => !item.atual).length;

  return (
    <main className={base.pagina}>
      <header className={base.cabecalho}>
        <div>
          <h1>Dispositivos conectados</h1>
          <p>Consulte os aparelhos com acesso à sua conta.</p>
        </div>
        {idConta && outros > 0 && (
          <button type="button" className={base.botaoPerigoContorno} onClick={() => setConfirmandoTodos(true)}>
            Desconectar os outros ({outros})
          </button>
        )}
      </header>

      {erro && (
        <p role="alert" style={{ color: '#c0392b' }}>
          {erro}
        </p>
      )}

      {carregando ? (
        <p>Carregando aparelhos...</p>
      ) : (
        <ul className={styles.lista}>
          {dispositivos.map((dispositivo) => {
            const Icone = ICONES[dispositivo.tipo] || Monitor;

            return (
              <li className={styles.item} key={dispositivo.id}>
                <Icone size={32} aria-hidden="true" className={styles.icone} />

                <div className={styles.texto}>
                  <strong>
                    {dispositivo.nome}
                    {dispositivo.atual && <span className={base.status}>Este dispositivo</span>}
                  </strong>
                  <span>{dispositivo.navegador}</span>
                  <span>{textoUltimoAcesso(dispositivo)}</span>
                </div>

                <button
                  type="button"
                  className={base.botaoPerigoContorno}
                  onClick={() => setSelecionado(dispositivo)}
                >
                  Desconectar
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {selecionado && (
        <Modal titulo={`Desconectar ${selecionado.nome}?`} aoFechar={() => setSelecionado(null)}>
          <p className={estiloModal.descricao}>
            {selecionado.atual
              ? `${selecionado.navegador}. Você voltará para a página inicial, como ao clicar em Sair.`
              : `${selecionado.navegador}. O login nesse aparelho será encerrado na hora.`}
          </p>

          <div className={estiloModal.acoes}>
            <button
              type="button"
              className={estiloModal.secundario}
              onClick={() => setSelecionado(null)}
            >
              Cancelar
            </button>
            <button type="button" className={estiloModal.perigo} onClick={() => desconectar(selecionado)}>
              Desconectar dispositivo
            </button>
          </div>
        </Modal>
      )}

      {confirmandoTodos && (
        <Modal titulo="Desconectar os outros aparelhos?" aoFechar={() => setConfirmandoTodos(false)}>
          <p className={estiloModal.descricao}>
            O login será encerrado em todos os aparelhos, menos neste.
          </p>

          <div className={estiloModal.acoes}>
            <button type="button" className={estiloModal.secundario} onClick={() => setConfirmandoTodos(false)}>
              Cancelar
            </button>
            <button type="button" className={estiloModal.perigo} onClick={desconectarOutros}>
              Desconectar os outros
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default DispositivosConectados;
