import { useEffect, useState } from 'react';
import { CircleCheck, ChevronDown } from 'lucide-react';
import '@/modulos/feirante/paginas/financeiro/financeiro.css';
import Modal from '@/compartilhado/componentes/modal/Modal';
import base from '@/compartilhado/componentes/modal/Modal.module.css';
import { formatarDataHora, formatarMoeda } from '@/compartilhado/servicos/pedidos';
import {
  TIPOS_CHAVE_PIX,
  carregarDadosDeSaque,
  solicitarSaque,
  validarChavePix,
} from '@/modulos/feirante/servicos/saquesFeirante';
import Styles from './estilos/Sacar.module.css';

function rotuloDoTipo(tipo) {
  const encontrado = TIPOS_CHAVE_PIX.find((item) => item.valor === tipo);

  return encontrado ? encontrado.rotulo : 'Pix';
}

// Tela fictícia de saque: o feirante transfere para o Pix o que recebeu pelas vendas no Xepa+.
function Sacar() {
  const [saques, setSaques] = useState([]);
  const [saldo, setSaldo] = useState({ recebido: 0, sacado: 0, disponivel: 0 });
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [tipoChave, setTipoChave] = useState('cpf');
  const [chave, setChave] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [ultimoSaque, setUltimoSaque] = useState(null);
  // Saque validado esperando a confirmação no pop-up.
  const [saquePendente, setSaquePendente] = useState(null);

  function atualizarDados() {
    return carregarDadosDeSaque().then((dados) => {
      setSaldo(dados.saldo);
      setSaques(dados.saques);
    });
  }

  useEffect(() => {
    let ativo = true;

    carregarDadosDeSaque()
      .then((dados) => {
        if (!ativo) return;
        setSaldo(dados.saldo);
        setSaques(dados.saques);
      })
      .catch((falha) => ativo && setErro(falha.message))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, []);

  const exemplo = TIPOS_CHAVE_PIX.find((item) => item.valor === tipoChave).exemplo;

  function sacar(evento) {
    evento.preventDefault();

    const valorNumero = Math.round(Number(String(valor).replace(',', '.')) * 100) / 100;
    const erroChave = validarChavePix(tipoChave, chave);

    if (erroChave) return setErro(erroChave);
    if (!valorNumero || valorNumero <= 0) return setErro('Informe um valor maior que zero.');
    if (valorNumero > saldo.disponivel) return setErro('O valor é maior que o seu saldo disponível.');

    setErro('');
    setSaquePendente({ valor: valorNumero, tipoChave, chave: chave.trim() });
  }

  async function confirmarSaque() {
    setEnviando(true);
    try {
      const saque = await solicitarSaque(saquePendente);
      setUltimoSaque(saque);
      setValor('');
      setErro('');
      // Recarrega saldo e histórico como o servidor calculou.
      await atualizarDados();
    } catch (falha) {
      setErro(falha.message);
    } finally {
      setEnviando(false);
      setSaquePendente(null);
    }
  }

  return (
    <div className={`pagina ${Styles.pagina}`}>
      <main className="conteudo">
        <section className="titulo">
          <div>
            <h1>Sacar lucros</h1>
            <p>Transfira para o seu Pix o que você recebeu pelas vendas de xepa no Xepa+.</p>
          </div>
        </section>

        {carregando && <p className="aviso-financeiro carregando">Carregando seu saldo...</p>}

        <section className={Styles.saldos}>
          <article className={`${Styles.card} ${Styles.destaque}`}>
            <h2>Saldo disponível</h2>
            <p>Vendas pelo Xepa+</p>
            <strong>{formatarMoeda(saldo.disponivel)}</strong>
          </article>
          <article className={Styles.card}>
            <h2>Já sacado</h2>
            <p>Total transferido para o Pix</p>
            <strong>{formatarMoeda(saldo.sacado)}</strong>
          </article>
        </section>

        <section className={Styles.painel}>
          <form className={`${base.form} ${Styles.formulario}`} onSubmit={sacar} noValidate>
            <h2>Sacar no Pix</h2>

            <div className={base.grade}>
              <div className={base.campo}>
                <label htmlFor="tipoChave">Tipo de chave</label>
                <div className={base.campoSelect}>
                  <select
                    id="tipoChave"
                    value={tipoChave}
                    onChange={(evento) => {
                      setTipoChave(evento.target.value);
                      setErro('');
                    }}
                  >
                    {TIPOS_CHAVE_PIX.map((tipo) => (
                      <option key={tipo.valor} value={tipo.valor}>
                        {tipo.rotulo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={base.iconeSelect} aria-hidden="true" />
                </div>
              </div>

              <div className={base.campo}>
                <label htmlFor="chavePix">Chave Pix</label>
                <input
                  id="chavePix"
                  value={chave}
                  onChange={(evento) => setChave(evento.target.value)}
                  placeholder={exemplo}
                  inputMode={['cpf', 'cnpj', 'celular'].includes(tipoChave) ? 'numeric' : 'text'}
                  autoComplete="off"
                />
              </div>
            </div>

            <div className={base.campo}>
              <label htmlFor="valorSaque">Valor do saque</label>
              <div className={Styles.linhaValor}>
                <input
                  id="valorSaque"
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={saldo.disponivel}
                  value={valor}
                  onChange={(evento) => setValor(evento.target.value)}
                  placeholder="0,00"
                />
                <button
                  type="button"
                  className={base.secundario}
                  onClick={() => setValor(saldo.disponivel.toFixed(2))}
                  disabled={saldo.disponivel <= 0}
                >
                  Sacar tudo
                </button>
              </div>
            </div>

            {erro && (
              <p role="alert" className={Styles.erro}>
                {erro}
              </p>
            )}

            <button type="submit" className={base.principal} disabled={saldo.disponivel <= 0}>
              Sacar
            </button>

            <p className={Styles.aviso}>
              Simulação: nenhum dinheiro é transferido de verdade.
            </p>
          </form>

          {ultimoSaque && (
            <div className={Styles.sucesso} role="status">
              <CircleCheck size={28} aria-hidden="true" />
              <div>
                <strong>Saque de {formatarMoeda(ultimoSaque.valor)} solicitado!</strong>
                <p>
                  Enviado para a chave {rotuloDoTipo(ultimoSaque.tipoChave)} {ultimoSaque.chave}.
                </p>
              </div>
            </div>
          )}
        </section>

        <section className={Styles.historico} aria-labelledby="tituloSaques">
          <h2 id="tituloSaques">Histórico de saques</h2>

          {saques.length === 0 ? (
            <p className={Styles.vazio}>Você ainda não fez nenhum saque.</p>
          ) : (
            <ul>
              {saques.map((saque) => (
                <li key={saque.id}>
                  <div>
                    <strong>{formatarMoeda(saque.valor)}</strong>
                    <small>
                      Pix {rotuloDoTipo(saque.tipoChave)} · {saque.chave}
                    </small>
                  </div>
                  <span>{formatarDataHora(saque.data)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {saquePendente && (
        <Modal titulo="Confirmar saque" aoFechar={() => setSaquePendente(null)}>
          <p className={base.descricao}>
            Sacar <strong>{formatarMoeda(saquePendente.valor)}</strong> para a chave Pix{' '}
            {rotuloDoTipo(saquePendente.tipoChave)} <strong>{saquePendente.chave}</strong>?
          </p>
          <p className={base.descricao}>
            Confira a chave antes de confirmar. Depois de enviado, o saque não pode ser desfeito.
          </p>

          <div className={base.acoes}>
            <button
              type="button"
              className={base.secundario}
              onClick={() => setSaquePendente(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={base.principal}
              onClick={confirmarSaque}
              disabled={enviando}
            >
              {enviando ? 'Enviando...' : 'Confirmar saque'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Sacar;
