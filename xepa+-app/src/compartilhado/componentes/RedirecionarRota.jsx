import { Navigate, useLocation } from 'react-router-dom';

// Endereço antigo -> novo, mantendo a busca (?xepa=12) e a âncora (#secao).
// Assim links salvos ou compartilhados antes da troca de URLs continuam funcionando.
function RedirecionarRota({ para }) {
  const { search, hash, state } = useLocation();
  return <Navigate to={`${para}${search}${hash}`} state={state} replace />;
}

export default RedirecionarRota;
