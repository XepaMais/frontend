import { useState } from 'react';
import { Lock } from 'lucide-react';
import { entrarAdmin } from '@/modulos/admin/servicos/adminApi';
import estilos from './Admin.module.css';

function LoginAdmin({ aoEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrarAdmin(email, senha);
      aoEntrar();
    } catch (falha) {
      setErro(falha.message);
      setEnviando(false);
    }
  }

  return (
    <main className={estilos.telaLogin}>
      <form className={estilos.cartaoLogin} onSubmit={enviar}>
        <div className={estilos.iconeLogin}>
          <Lock size={22} />
        </div>
        <h1>Painel administrativo</h1>
        <p className={estilos.subtitulo}>Acesso restrito à equipe Xepa+</p>

        <label className={estilos.campo}>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className={estilos.campo}>
          Senha
          <input
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>

        {erro && <p className={estilos.erro}>{erro}</p>}

        <button type="submit" className={estilos.botaoPrimario} disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}

export default LoginAdmin;
