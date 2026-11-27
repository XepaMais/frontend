import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ShoppingBasket, Sprout, Store } from 'lucide-react';
import Modal from '@/compartilhado/componentes/modal/Modal';
import Crumb from '@/modulos/autenticacao/paginas/Crumb';
import { encerrarSessao, entrarNaDemo } from '@/compartilhado/servicos/autenticacao';
import Styles from '@/modulos/autenticacao/paginas/demo/demo.module.css';

// Cada perfil entra numa conta fictícia da API (dados na AWS): o que aparece e o que for feito
// na demonstração é o mesmo em qualquer aparelho.
const PERFIS = [
  {
    nome: 'Consumidor',
    descricao: 'Encontre xepas perto de você, monte seu carrinho e veja o seu impacto.',
    Icone: ShoppingBasket,
    cor: Styles.verde,
    perfil: 'consumidor',
  },
  {
    nome: 'Feirante - Plano Semente',
    descricao: 'Cadastre suas feiras e xepas e converse com os clientes.',
    Icone: Store,
    cor: Styles.limao,
    perfil: 'gratis',
  },
  {
    nome: 'Feirante - Plano Broto',
    descricao: 'Tudo do Semente, com gestão financeira básica e Xepinha.',
    Icone: Sprout,
    cor: Styles.amarelo,
    perfil: 'crescer',
  },
  {
    nome: 'Feirante - Plano Colheita',
    descricao: 'Acesso a tudo: gestão financeira completa, planilhas e Xepinha.',
    Icone: Crown,
    cor: Styles.laranja,
    perfil: 'pro',
  },
];

function Demo() {
  const navigate = useNavigate();
  const [entrando, setEntrando] = useState(null);
  const [erro, setErro] = useState('');

  async function entrar(perfil) {
    setErro('');
    setEntrando(perfil.perfil);
    encerrarSessao();

    try {
      const conta = await entrarNaDemo(perfil.perfil);
      navigate(conta.tipo === 'FEIRANTE' ? '/feirante' : '/consumidor');
    } catch (falha) {
      setErro(falha.message);
      setEntrando(null);
    }
  }

  return (
    <>
      <div className={Styles.telaDesfocada}>
        <Crumb />
      </div>

      <Modal
        classeJanela={Styles.janelaDemo}
        titulo="Demonstração do Xepa+"
        descricao="Escolha um perfil para conhecer a plataforma. Cada plano de feirante libera recursos diferentes."
        aoFechar={() => navigate('/entrar')}
      >
        <div className={Styles.lista}>
          {PERFIS.map((perfil) => (
            <button
              key={perfil.nome}
              type="button"
              className={`${Styles.opcao} ${perfil.cor}`}
              onClick={() => entrar(perfil)}
              disabled={entrando !== null}
              aria-busy={entrando === perfil.perfil}
            >
              <span className={Styles.icone}>
                <perfil.Icone size={24} aria-hidden="true" />
              </span>

              <span className={Styles.texto}>
                <span className={Styles.topo}>
                  <strong>{perfil.nome}</strong>
                </span>
                <span className={Styles.descricao}>
                  {entrando === perfil.perfil ? 'Entrando...' : perfil.descricao}
                </span>
              </span>
            </button>
          ))}
        </div>
        {erro && <p role="alert" className={Styles.erro}>{erro}</p>}
      </Modal>
    </>
  );
}

export default Demo;
