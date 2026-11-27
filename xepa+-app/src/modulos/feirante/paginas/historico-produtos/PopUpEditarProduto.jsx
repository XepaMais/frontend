import { useState } from 'react';
import Modal from '@/compartilhado/componentes/modal/Modal';
import base from '@/compartilhado/componentes/modal/Modal.module.css';
import { CATEGORIAS_XEPA } from '@/compartilhado/servicos/xepas';
import { editarProduto } from '@/modulos/feirante/servicos/produtosFeirante';

// Corrige a xepa já cadastrada. Quantidade 0 tira a xepa da vitrine (esgotada).
function PopUpEditarProduto({ produto, onFechar, onSalvo }) {
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar(evento) {
    evento.preventDefault();
    const dados = new FormData(evento.currentTarget);
    const validade = dados.get('validade');

    setErro('');
    setSalvando(true);
    try {
      await editarProduto(produto, {
        nome: dados.get('nome').trim(),
        categoria: dados.get('categoria'),
        preco: Number(dados.get('preco')),
        quantidade: Number(dados.get('quantidade')),
        ...(validade ? { validade } : {}),
        itens: dados.get('itens').trim(),
        descricao: dados.get('descricao').trim(),
      });
      onSalvo();
    } catch (falha) {
      setErro(falha.message);
      setSalvando(false);
    }
  }

  return (
    <Modal titulo="Editar xepa" descricao="Atualize os dados que mudaram." aoFechar={onFechar}>
      <form className={base.form} onSubmit={salvar}>
        <div className={base.grade}>
          <div className={base.campo}>
            <label htmlFor="editar-nome">Nome do Produto</label>
            <input id="editar-nome" name="nome" defaultValue={produto.nome} required maxLength={100} />
          </div>

          <div className={base.campo}>
            <label htmlFor="editar-categoria">Categoria</label>
            <select id="editar-categoria" name="categoria" defaultValue={produto.categoria} required>
              {CATEGORIAS_XEPA.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div className={base.campo}>
            <label htmlFor="editar-preco">Preço</label>
            <input id="editar-preco" name="preco" type="number" min="0.01" step="0.01" defaultValue={produto.preco} required />
          </div>

          <div className={base.campo}>
            <label htmlFor="editar-quantidade">Quantidade disponível</label>
            <input
              id="editar-quantidade"
              name="quantidade"
              type="number"
              min="0"
              step="1"
              defaultValue={produto.quantidade}
              required
            />
          </div>

          <div className={base.campo}>
            <label htmlFor="editar-validade">Validade Estimada</label>
            <input id="editar-validade" name="validade" type="date" defaultValue={produto.validade || ''} />
          </div>
        </div>

        <div className={base.campo}>
          <label htmlFor="editar-itens">O que vem na xepa</label>
          <input id="editar-itens" name="itens" defaultValue={produto.itens || ''} />
        </div>

        <div className={base.campo}>
          <label htmlFor="editar-descricao">Descrição do Produto</label>
          <textarea id="editar-descricao" name="descricao" defaultValue={produto.descricao || ''} />
        </div>

        {erro && (
          <p className={base.erro} role="alert">
            {erro}
          </p>
        )}

        <div className={base.acoes}>
          <button type="button" className={base.secundario} onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className={base.principal} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default PopUpEditarProduto;
