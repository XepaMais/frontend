import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Styles from '@/modulos/autenticacao/paginas/estilos/Autenticacao.module.css';

// Botão "Voltar" no topo das telas de login e cadastro, para a pessoa não ficar presa nelas.
function BotaoVoltar({ destino, texto = 'Voltar' }) {
  const navigate = useNavigate();

  return (
    <button type="button" className={Styles.voltar} onClick={() => navigate(destino)}>
      <ArrowLeft size={18} aria-hidden="true" />
      {texto}
    </button>
  );
}

export default BotaoVoltar;
