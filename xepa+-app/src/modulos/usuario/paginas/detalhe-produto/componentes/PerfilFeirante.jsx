import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisicaoApi, urlDaApi } from '@/compartilhado/servicos/api';
import { Estrelas } from '@/modulos/usuario/paginas/historico-pedidos/AvaliarPedido';
import { abrirConversaDaXepa } from '@/compartilhado/servicos/conversas';
import { carregarPerfil } from '@/compartilhado/servicos/perfil';
import { carregarTodasFeiras } from '@/modulos/feirante/servicos/feirasFeirante';
import styles from '@/modulos/usuario/paginas/detalhe-produto/estilos/PerfilFeirante.module.css';

const NOMES_DIAS = {
  Dom: 'Domingo',
  Seg: 'Segunda',
  Ter: 'Terça',
  Qua: 'Quarta',
  Qui: 'Quinta',
  Sex: 'Sexta',
  Sáb: 'Sábado',
};

function iniciais(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function descreverDias(dias) {
  if (!dias || dias.length === 0) return '';

  const nomes = dias.map((dia) => NOMES_DIAS[dia] || dia);
  if (nomes.length === 1) return nomes[0];

  return `${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
}

// Deixa a primeira letra de cada nome maiúscula ("fernanda" vira "Fernanda").
function capitalizar(nome) {
  return nome.trim().replace(/(^|\s)\S/g, (letra) => letra.toUpperCase());
}

function PerfilFeirante({ xepa }) {
  const navegar = useNavigate();

  // Xepa da API: foto, barraca e avaliações do feirante vêm do perfil público (GET /api/feirantes/{id}).
  const [perfilApi, setPerfilApi] = useState(null);
  const idFeiranteApi = xepa.origem === 'api' ? xepa.idFeirante : null;

  useEffect(() => {
    if (!idFeiranteApi) return undefined;
    let ativo = true;
    requisicaoApi(`/feirantes/${idFeiranteApi}`)
      .then((dados) => ativo && setPerfilApi(dados))
      .catch(() => {
        // Sem conexão: mostra só o que veio com a xepa.
      });
    return () => {
      ativo = false;
    };
  }, [idFeiranteApi]);

  const nomeFeirante = perfilApi?.nome || xepa.feirante || 'Feirante';
  // Modo demonstração: o perfil salvo neste navegador é o do feirante que cadastrou a xepa.
  const perfil = carregarPerfil('feirante');
  const foto = perfilApi ? urlDaApi(perfilApi.foto) : (perfil.nome === nomeFeirante ? perfil.foto : '');
  const barraca = perfilApi?.barraca || xepa.barraca || (perfil.nome === nomeFeirante ? perfil.barraca : '');

  const feira = carregarTodasFeiras().find((item) => item.nome === xepa.feira);
  // Quem atende: da API (feira da xepa no perfil do feirante) ou, no modo demonstração, da cópia local.
  const feiraApi = perfilApi?.feiras?.find((item) => item.idFeira === xepa.idFeira);
  const funcionarios = (feiraApi ? feiraApi.funcionarios : feira?.funcionarios || [])
    .filter(Boolean)
    .map(capitalizar);
  const dias = descreverDias(xepa.dias || feira?.dias);
  const horario = xepa.horario || feira?.horario || '';

  const informacoes = [
    { rotulo: 'Feira', valor: xepa.feira },
    { rotulo: 'Dias de retirada', valor: dias },
    { rotulo: 'Horário', valor: horario || 'Combine pelo chat' },
    { rotulo: 'Atendimento', valor: funcionarios.length ? [nomeFeirante, ...funcionarios].join(', ') : '' },
  ].filter((item) => item.valor);

  // Abre (ou reaproveita) a conversa sobre esta xepa e leva direto para ela.
  async function falarComFeirante() {
    try {
      const id = await abrirConversaDaXepa(xepa);
      navegar('/HistoricoChatUsuario', { state: { conversa: id } });
    } catch (falha) {
      window.alert(falha.message);
    }
  }

  return (
    <section className={styles.perfil}>
      <h2>Perfil do feirante</h2>
      <p className={styles.sub}>Conheça quem preparou sua xepa</p>

      <div className={styles.pessoa}>
        {foto ? (
          <img className={styles.avatar} src={foto} alt="" />
        ) : (
          <span className={styles.avatar} aria-hidden="true">
            {iniciais(nomeFeirante)}
          </span>
        )}
        <div>
          <strong>{nomeFeirante}</strong>
          {barraca && <span>Barraca {barraca}</span>}
          {perfilApi?.totalAvaliacoes > 0 && (
            <span>
              <Estrelas nota={Math.round(Number(perfilApi.media))} tamanho={14} />{' '}
              {Number(perfilApi.media).toLocaleString('pt-BR', { minimumFractionDigits: 1 })} ·{' '}
              {perfilApi.totalAvaliacoes} {perfilApi.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
            </span>
          )}
        </div>
      </div>

      <dl className={styles.dados}>
        {informacoes.map((item) => (
          <div key={item.rotulo}>
            <dt>{item.rotulo}</dt>
            <dd>{item.valor}</dd>
          </div>
        ))}
      </dl>

      <button type="button" className={styles.botao} onClick={falarComFeirante}>
        Falar com o feirante
      </button>
    </section>
  );
}

export default PerfilFeirante;
