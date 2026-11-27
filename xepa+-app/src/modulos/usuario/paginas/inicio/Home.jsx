import { useState } from 'react';
import useXepas from '@/modulos/usuario/hooks/useXepas';
import { Saudacao, SecaoUm } from '@/modulos/usuario/paginas/inicio/componentes/SecaoUm.jsx';
import { SecaoDois } from '@/modulos/usuario/paginas/inicio/componentes/SecaoDois.jsx';
import { SecaoTres } from '@/modulos/usuario/paginas/inicio/componentes/SecaoTres.jsx';
import { SecaoQuatro } from '@/modulos/usuario/paginas/inicio/componentes/SecaoQuatro.jsx';

function HomeUsuario() {
  // Xepas da API (feirantes logados) + as do modo demonstração.
  const { xepas } = useXepas();
  const [categoria, setCategoria] = useState('');
  const [busca, setBusca] = useState('');

  return (
    <div>
      <Saudacao />
      <SecaoDois />
      <SecaoUm
        xepas={xepas}
        categoria={categoria}
        aoEscolherCategoria={setCategoria}
        busca={busca}
        aoBuscar={setBusca}
      />
      <SecaoTres xepas={xepas} />
      <SecaoQuatro xepas={xepas} categoria={categoria} busca={busca} />
    </div>
  );
}

export default HomeUsuario;
