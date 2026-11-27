// Perfil do consumidor ('usuario') e do feirante.
// - Conta logada: tudo fica na API (/api/conta/{idConta}/perfil), inclusive a foto
//   (/api/imagens) — vale em qualquer aparelho. Uma cópia fica no navegador para mostrar na hora.
// - Modo demonstração: fica só neste navegador.
import { carregarContaDaSessao } from '@/compartilhado/servicos/autenticacao';
import { enviarImagem, enviarJson, requisicaoApi, urlDaApi } from '@/compartilhado/servicos/api';

// Mesma chave usada em autenticacao.js para a conta logada.
const CHAVE_SESSAO = 'xepaConta';

const CHAVES = {
  usuario: 'perfilUsuario',
  feirante: 'perfilFeirante',
};

// Nomes que o projeto já usava nas áreas de demonstração.
// Os campos seguem o cadastro. A foto fica vazia até a pessoa escolher uma.

const DADOS_PESSOAIS = { cpf: '', telefone: '', nascimento: '', email: '', foto: '' };

const CAMPOS_FEIRANTE = ['matricula', 'validade', 'cnpj', 'ccm', 'titular', 'barraca', 'grupo'];

const PERFIS_INICIAIS = {
  usuario: { nome: 'Henrique Mazza', ...DADOS_PESSOAIS },
  feirante: {
    nome: 'Fabiane',
    ...DADOS_PESSOAIS,
    matricula: '',
    validade: '',
    cnpj: '',
    ccm: '',
    titular: '',
    barraca: '',
    grupo: '',
  },
};

export const EVENTO_PERFIL = 'perfil-atualizado';

// Conta logada do mesmo tipo do perfil (consumidor -> 'usuario', feirante -> 'feirante'), ou null.
function contaDoTipo(tipo) {
  const conta = carregarContaDaSessao();
  const tipoEsperado = tipo === 'feirante' ? 'FEIRANTE' : 'CONSUMIDOR';

  return conta?.tipo === tipoEsperado ? conta : null;
}

// Cada conta logada tem a sua cópia (duas contas no mesmo computador não se misturam).
function chave(tipo) {
  const conta = contaDoTipo(tipo);

  return conta ? `${CHAVES[tipo]}:${conta.id}` : CHAVES[tipo];
}

export function carregarPerfil(tipo) {
  const salvo = JSON.parse(localStorage.getItem(chave(tipo)));
  const perfil = { ...PERFIS_INICIAIS[tipo], ...salvo };
  const conta = contaDoTipo(tipo);

  if (!conta) return perfil;

  return {
    ...perfil,
    nome: conta.nome || perfil.nome,
    email: conta.email || perfil.email,
  };
}

// O login guarda nome e email na sessão; mantém igual ao que a API devolveu.
function atualizarContaDaSessao(conta, dadosApi) {
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ ...conta, nome: dadosApi.nome, email: dadosApi.email }));
}

// Resposta da API -> campos da tela de perfil.
function perfilDaApi(dados) {
  const perfil = {
    nome: dados.nome || '',
    email: dados.email || '',
    cpf: dados.cpf || '',
    telefone: dados.telefone || '',
    nascimento: dados.nascimento || '',
    foto: urlDaApi(dados.foto),
  };

  if (dados.tipo === 'FEIRANTE') {
    for (const campo of CAMPOS_FEIRANTE) perfil[campo] = dados[campo] || '';
  }
  return perfil;
}

function gravarCopia(tipo, perfil) {
  localStorage.setItem(chave(tipo), JSON.stringify(perfil));
  window.dispatchEvent(new Event(EVENTO_PERFIL));
}

// Conta logada: manda para a API só o que mudou (foto nova vai antes para /api/imagens).
// Devolve uma Promise; erro = a API recusou (ex.: email já usado) e nada é salvo.
export async function salvarPerfil(tipo, dados) {
  const conta = contaDoTipo(tipo);

  if (!conta) {
    gravarCopia(tipo, dados);
    return;
  }

  const anterior = carregarPerfil(tipo);
  const campos = ['nome', 'email', 'cpf', 'telefone', 'nascimento',
    ...(tipo === 'feirante' ? CAMPOS_FEIRANTE : [])];
  const mudancas = {};

  for (const campo of campos) {
    if ((dados[campo] ?? '') !== (anterior[campo] ?? '')) mudancas[campo] = dados[campo] ?? '';
  }
  // Data vazia não apaga a que já está salva.
  if (mudancas.nascimento === '') delete mudancas.nascimento;

  if ((dados.foto || '') !== (anterior.foto || '')) {
    mudancas.foto = dados.foto?.startsWith('data:') ? await enviarImagem(dados.foto) : (dados.foto || '');
  }

  if (Object.keys(mudancas).length === 0) return;

  const resposta = await enviarJson(`/conta/${conta.id}/perfil`, mudancas, 'PUT');
  atualizarContaDaSessao(conta, resposta);
  gravarCopia(tipo, { ...dados, ...perfilDaApi(resposta) });
}

// Ao abrir o app logado: traz o perfil salvo na API.
export async function sincronizarPerfil(tipo) {
  const conta = contaDoTipo(tipo);
  if (!conta) return;

  try {
    const dados = await requisicaoApi(`/conta/${conta.id}/perfil`);
    const salvo = JSON.parse(localStorage.getItem(chave(tipo))) || {};
    atualizarContaDaSessao(conta, dados);
    gravarCopia(tipo, { ...salvo, ...perfilDaApi(dados) });
  } catch {
    // Sem conexão: fica com os dados deste navegador.
  }
}
