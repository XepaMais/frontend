// Cadastro de produtos do feirante. Cada xepa guarda o dono (idFeirante): o feirante vê só as dele.
// Feirante logado com feira salva na API: a xepa é publicada na API (/api/feirante/{idConta}/xepas)
// e aparece para os consumidores de qualquer aparelho. Modo demonstração: fica neste navegador.
import {
  carregarXepasLocais,
  EVENTO_XEPAS,
  salvarXepas,
  sincronizarXepas,
  xepaDaApi,
} from '@/compartilhado/servicos/xepas';
import { ehDoFeiranteAtual, idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';
import { enviarImagem, enviarJson, requisicaoApi } from '@/compartilhado/servicos/api';

const LARGURA_MAXIMA_IMAGEM = 480;

// Cópia das xepas que o feirante logado publicou na API (inclui as esgotadas).
function chaveProdutosApi() {
  const id = idFeiranteAtual();
  return id === 'demo' ? null : `xepasFeiranteApi:${id}`;
}

export function carregarProdutos() {
  const chave = chaveProdutosApi();
  const daApi = chave ? JSON.parse(localStorage.getItem(chave)) || [] : [];

  return [...daApi, ...carregarXepasLocais().filter(ehDoFeiranteAtual)];
}

// Busca na API as xepas do feirante logado (GET /api/feirante/{idConta}/xepas).
export async function sincronizarProdutos() {
  const chave = chaveProdutosApi();
  if (!chave) return false;

  try {
    const xepas = await requisicaoApi(`/feirante/${idFeiranteAtual()}/xepas`);
    localStorage.setItem(chave, JSON.stringify(xepas.map(xepaDaApi)));
    window.dispatchEvent(new Event(EVENTO_XEPAS));
    return true;
  } catch {
    return false;
  }
}

// Feiras vindas da API têm id numérico pequeno; as do modo demonstração usam Date.now().
function feiraDaApi(idFeira) {
  return Number.isInteger(Number(idFeira)) && Number(idFeira) > 0 && Number(idFeira) < 1e9;
}

// Devolve { salvou: true } ou { salvou: false, erro }.
export async function adicionarProduto(produto, idFeira) {
  const idConta = idFeiranteAtual();

  if (idConta !== 'demo' && feiraDaApi(idFeira)) {
    try {
      // A foto vai primeiro para a API; a xepa guarda só o endereço dela.
      const imagem = produto.imagem ? await enviarImagem(produto.imagem) : null;
      await enviarJson(`/feirante/${idConta}/xepas`, {
        nome: produto.nome,
        categoria: produto.categoria,
        itens: produto.itens,
        descricao: produto.descricao,
        preco: produto.preco,
        quantidade: produto.quantidade,
        validade: produto.validade || null,
        idFeira: Number(idFeira),
        imagem,
      });
      await Promise.all([sincronizarXepas(), sincronizarProdutos()]);
      return { salvou: true };
    } catch (falha) {
      return { salvou: false, erro: falha.message };
    }
  }

  const novoProduto = {
    ...produto,
    id: Date.now(),
    idFeirante: idFeiranteAtual(),
    cadastradoEm: new Date().toISOString(),
  };

  try {
    salvarXepas([novoProduto, ...carregarXepasLocais()]);
    return { salvou: true };
  } catch {
    return { salvou: false, erro: 'Não há mais espaço no navegador para salvar este produto.' };
  }
}

// Reduz a foto antes de salvar, porque o localStorage tem pouco espaço.
export function reduzirImagem(arquivo) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    const endereco = URL.createObjectURL(arquivo);

    imagem.onload = () => {
      const escala = Math.min(1, LARGURA_MAXIMA_IMAGEM / imagem.width);
      const canvas = document.createElement('canvas');
      canvas.width = imagem.width * escala;
      canvas.height = imagem.height * escala;
      canvas.getContext('2d').drawImage(imagem, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(endereco);
      resolve(canvas.toDataURL('image/jpeg', 0.75));
    };

    imagem.onerror = () => {
      URL.revokeObjectURL(endereco);
      reject(new Error('Imagem inválida'));
    };

    imagem.src = endereco;
  });
}
