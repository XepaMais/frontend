// Produtos do feirante: cada xepa guarda o dono (idFeirante).
import { carregarXepas, salvarXepas } from '@/compartilhado/servicos/xepas';
import { ehDoFeiranteAtual, idFeiranteAtual } from '@/compartilhado/servicos/autenticacao';

const LARGURA_MAXIMA_IMAGEM = 480;

export function carregarProdutos() {
  return carregarXepas().filter(ehDoFeiranteAtual);
}

// Retorna false quando o navegador não tem mais espaço para guardar o produto.
export function adicionarProduto(produto) {
  const novoProduto = {
    ...produto,
    id: Date.now(),
    idFeirante: idFeiranteAtual(),
    cadastradoEm: new Date().toISOString(),
  };

  try {
    salvarXepas([novoProduto, ...carregarXepas()]);
    return true;
  } catch {
    return false;
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
