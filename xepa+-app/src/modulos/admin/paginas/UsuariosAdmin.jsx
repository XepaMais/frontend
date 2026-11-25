import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { listarUsuarios } from '@/modulos/admin/servicos/adminApi';
import estilos from './Admin.module.css';

// Compartilhado = conta que é feirante e consumidor ao mesmo tempo.
const TIPOS = [
  { id: 'TODOS', rotulo: 'Total de usuários', resumo: 'total' },
  { id: 'COMPARTILHADO', rotulo: 'Compartilhado', resumo: 'compartilhado', dica: 'Feirante e consumidor' },
  { id: 'FEIRANTE', rotulo: 'Feirante', resumo: 'feirante' },
  { id: 'CONSUMIDOR', rotulo: 'Consumidor', resumo: 'consumidor' },
  { id: 'SEM_TIPO', rotulo: 'Sem perfil', resumo: 'semTipo', dica: 'Conta sem feirante nem consumidor' },
];

const ROTULO_TIPO = Object.fromEntries(TIPOS.map((t) => [t.id, t.rotulo]));

function formatarData(texto) {
  if (!texto) return '—';
  const data = new Date(texto.replace(' ', 'T'));
  return Number.isNaN(data.getTime()) ? texto : data.toLocaleDateString('pt-BR');
}

function UsuariosAdmin({ aoErro }) {
  const [dados, setDados] = useState(null);
  const [tipo, setTipo] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    let ativo = true;
    listarUsuarios()
      .then((resultado) => ativo && setDados(resultado))
      .catch((falha) => ativo && aoErro(falha));
    return () => {
      ativo = false;
    };
  }, [versao, aoErro]);

  const lista = useMemo(() => {
    if (!dados) return [];
    const termo = busca.trim().toLowerCase();
    return dados.usuarios.filter(
      (u) =>
        (tipo === 'TODOS' || u.tipo === tipo) &&
        (!termo ||
          [u.nome, u.email, u.cpf, u.telefone, u.nomeFantasia].some((v) => v?.toLowerCase().includes(termo))),
    );
  }, [dados, tipo, busca]);

  // "Sem perfil" só aparece se existir alguma conta assim.
  const cartoes = TIPOS.filter((t) => t.id !== 'SEM_TIPO' || dados?.resumo.semTipo > 0);

  return (
    <>
      <header className={estilos.topo}>
        <div>
          <h1>Usuários cadastrados</h1>
          <p className={estilos.subtitulo}>
            {dados ? `${lista.length} de ${dados.resumo.total} exibidos` : 'Carregando…'}
          </p>
        </div>
        <div className={estilos.acoesTopo}>
          <label className={estilos.busca}>
            <Search size={16} />
            <input
              placeholder="Nome, email, CPF, telefone…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={estilos.botaoIcone}
            onClick={() => setVersao((v) => v + 1)}
            title="Recarregar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <div className={estilos.cartoes}>
        {cartoes.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${estilos.cartao} ${estilos[`cartao${t.id}`] ?? ''} ${tipo === t.id ? estilos.cartaoAtivo : ''}`}
            onClick={() => setTipo(t.id)}
          >
            <span className={estilos.cartaoRotulo}>{t.rotulo}</span>
            <strong className={estilos.cartaoNumero}>{dados ? dados.resumo[t.resumo] : '–'}</strong>
            {t.dica && <span className={estilos.cartaoDica}>{t.dica}</span>}
          </button>
        ))}
      </div>

      <div className={estilos.areaTabela}>
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Email</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Barraca</th>
              <th>Status</th>
              <th>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.nome}</td>
                <td>
                  <span className={`${estilos.selo} ${estilos[`selo${u.tipo}`] ?? ''}`}>{ROTULO_TIPO[u.tipo]}</span>
                </td>
                <td>{u.email}</td>
                <td>{u.cpf || '—'}</td>
                <td>{u.telefone || '—'}</td>
                <td>{u.nomeFantasia || '—'}</td>
                <td>{u.ativo ? 'Ativo' : <span className={estilos.nulo}>Inativo</span>}</td>
                <td>{formatarData(u.dataCadastro)}</td>
              </tr>
            ))}
            {dados && lista.length === 0 && (
              <tr>
                <td colSpan={9} className={estilos.vazio}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default UsuariosAdmin;
