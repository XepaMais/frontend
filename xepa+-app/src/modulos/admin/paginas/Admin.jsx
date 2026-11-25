import { useEffect, useState } from 'react';
import { tokenAdmin } from '@/modulos/admin/servicos/adminApi';
import LoginAdmin from './LoginAdmin';
import PainelAdmin from './PainelAdmin';

function Admin() {
  const [logado, setLogado] = useState(() => Boolean(tokenAdmin()));

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    const tituloAnterior = document.title;
    document.title = 'Admin · Xepa+';
    return () => {
      meta.remove();
      document.title = tituloAnterior;
    };
  }, []);

  return logado ? (
    <PainelAdmin aoSair={() => setLogado(false)} />
  ) : (
    <LoginAdmin aoEntrar={() => setLogado(true)} />
  );
}

export default Admin;
