import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { buscarXepa, xepaDaApi } from '@/compartilhado/servicos/xepas';
import { buscarXepaDaApi } from '@/modulos/usuario/servicos/consumidorApi';
import ProdutoTopo from '@/modulos/usuario/paginas/detalhe-produto/componentes/ProdutoTopo.jsx';
import LocalizacaoPerfil from '@/modulos/usuario/paginas/detalhe-produto/componentes/LocalizacaoPerfil.jsx';
import base from '@/compartilhado/estilos/conta.module.css';
import styles from '@/modulos/usuario/paginas/detalhe-produto/estilos/DetalheProduto.module.css';

// Id que pode ser de uma xepa da API (as do modo demonstração usam Date.now(), muito maiores).
function podeEstarNaApi(id) {
  return /^\d{1,9}$/.test(id || '');
}

function DetalheProduto() {
  const [parametros] = useSearchParams();
  const id = parametros.get('xepa');
  // Primeiro a cópia local; se a xepa não estiver nela (link aberto direto), busca na API.
  const local = buscarXepa(id);
  const precisaBuscar = !local && podeEstarNaApi(id);
  // { id, xepa } da última busca na API (null = não encontrada).
  const [remota, setRemota] = useState(null);

  useEffect(() => {
    if (!precisaBuscar) return undefined;

    let ativo = true;
    buscarXepaDaApi(id)
      .then((resposta) => ativo && setRemota({ id, xepa: xepaDaApi(resposta) }))
      .catch(() => ativo && setRemota({ id, xepa: null }));

    return () => {
      ativo = false;
    };
  }, [id, precisaBuscar]);

  const xepa = local || (remota?.id === id ? remota.xepa : null);
  const buscando = precisaBuscar && remota?.id !== id;

  return (
    <div className={styles.pagina}>
      <main className={styles.conteudo}>
        {xepa ? (
          <>
            <ProdutoTopo xepa={xepa} />
            <LocalizacaoPerfil xepa={xepa} />
          </>
        ) : buscando ? (
          <section className={base.vazio}>
            <Package size={44} aria-hidden="true" />
            <h2>Carregando xepa...</h2>
          </section>
        ) : (
          <section className={base.vazio}>
            <Package size={44} aria-hidden="true" />
            <h2>Xepa não encontrada</h2>
            <p>Escolha uma das xepas disponíveis na página inicial.</p>
            <Link to="/homeU" className={base.botaoPrincipal}>
              Ver xepas
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

export default DetalheProduto;
