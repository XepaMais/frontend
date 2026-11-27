import { useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import Styles from '../estilos/MapU.module.css'
import Modal from '@/compartilhado/componentes/modal/Modal'
import logoXepa from '@/assets/imagens/gerais/logo-colorida.png'
import { GOOGLE_MAPS_LOADER } from '@/compartilhado/servicos/googleMaps'
import BarraPesquisa from '@/compartilhado/componentes/barra-pesquisa/BarraPesquisa'
import { buscarFeirasProximas, listarFeiras } from '@/modulos/usuario/servicos/feiras'
import { buscarCep, geocodificarEndereco } from '@/compartilhado/servicos/localizacao'

const NOMES_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// A API manda latitude/longitude, horários "07:00:00" e dias 1=segunda ... 7=domingo;
// o mapa usa position, "07:00" e o texto dos dias.
function feiraParaMapa(feira) {
  const inicio = feira.horarioInicio?.slice(0, 5);
  const fim = feira.horarioFim?.slice(0, 5);
  const dias = (feira.dias ?? []).map((dia) => NOMES_DIAS[dia - 1]).filter(Boolean);

  return {
    id: feira.id,
    nome: feira.nome,
    descricao: [feira.endereco, feira.cidade].filter(Boolean).join(' - '),
    dias: dias.length === 7 ? 'Todos os dias' : dias.join(', '),
    horario: inicio && fim ? `${inicio} às ${fim}` : '',
    position: { lat: Number(feira.latitude), lng: Number(feira.longitude) },
  };
}

// Compara nomes sem acento e sem diferença de maiúsculas.
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('pt-BR').trim();
}

function MapPage() {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER);

  const [busca, setBusca] = useState('');
  const [aviso, setAviso] = useState('');
  const [feiraSelecionada, setFeiraSelecionada] = useState(null);

  // O centro do mapa começa na posição padrão, mas mudará para a do usuário
  const [mapCenter, setMapCenter] = useState({
    lat: -23.5280859,
    lng: -46.6917602,
  });

  // Posição GPS do usuário.
  const [userPosition, setUserPosition] = useState(null);

  // Feiras vindas da API, perto do centro do mapa (GPS do usuário, CEP ou feira buscada).
  const [feiras, setFeiras] = useState([]);

  useEffect(() => {
    let ativo = true;

    buscarFeirasProximas(mapCenter.lat, mapCenter.lng)
      .then((lista) => {
        if (ativo) setFeiras(lista.map(feiraParaMapa));
      })
      .catch((erro) => {
        if (ativo) setAviso(erro.message);
      });

    // Se o centro mudar antes da resposta chegar, ignora a resposta antiga.
    return () => {
      ativo = false;
    };
  }, [mapCenter]);

  // Pega a posição ao abrir a tela.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const dadosPosicao = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          // Centraliza o mapa no usuário e salva a posição dele para o marcador azul
          setMapCenter(dadosPosicao);
          setUserPosition(dadosPosicao);
        },
        () => {
          console.log("O usuário negou a permissão de localização ou o GPS está desligado.");
        }
      );
    }
  }, []);

  // A barra aceita CEP (8 números) ou o nome de uma feira.
  const buscar = () => {
    const texto = busca.trim();
    if (!texto) return;

    const semSeparadores = texto.replace(/[\s.-]/g, '');
    if (/^\d{8}$/.test(semSeparadores)) {
      buscarRegiaoPorCep(semSeparadores);
    } else {
      buscarFeiraPorNome(texto);
    }
  };

  // Busca por CEP caso o usuário queira pesquisar outra região
  // ViaCEP dá o endereço e o OpenStreetMap dá a posição (não depende da chave do Google).
  const buscarRegiaoPorCep = async (valor) => {
    try {
      const dados = await buscarCep(valor);
      if (!dados) {
        setAviso('Não encontramos este CEP. Confira os números.');
        return;
      }

      const endereco = [dados.logradouro, dados.bairro, dados.cidade, dados.uf].filter(Boolean).join(', ');
      const local =
        (await geocodificarEndereco(endereco)) ||
        // Se a rua não for encontrada, tenta pelo bairro e cidade.
        (await geocodificarEndereco([dados.bairro, dados.cidade, dados.uf].filter(Boolean).join(', ')));

      if (!local) {
        setAviso('Não conseguimos achar este CEP no mapa. Tente outro.');
        return;
      }

      setFeiraSelecionada(null);
      setMapCenter({ lat: local.latitude, lng: local.longitude });
    } catch {
      setAviso('Não foi possível buscar o CEP agora. Tente novamente.');
    }
  };

  // Procura a feira pelo nome (primeiro nas que já estão no mapa, depois em todas),
  // centraliza o mapa nela e abre o balão com os dados.
  const buscarFeiraPorNome = async (texto) => {
    const termo = normalizar(texto);
    const combina = (feira) => normalizar(feira.nome).includes(termo);

    let encontrada = feiras.find(combina);

    if (!encontrada) {
      try {
        const todas = (await listarFeiras()).map(feiraParaMapa);
        encontrada = todas.find(combina);
      } catch (erro) {
        setAviso(erro.message);
        return;
      }
    }

    if (!encontrada || Number.isNaN(encontrada.position.lat) || Number.isNaN(encontrada.position.lng)) {
      setAviso('Não encontramos nenhuma feira com esse nome.');
      return;
    }

    setMapCenter(encontrada.position);
    setFeiraSelecionada(encontrada);
  };

  return (
    <div className={Styles.pageContainer}>

      <BarraPesquisa
        className={Styles.searchForm}
        valor={busca}
        aoMudar={setBusca}
        aoBuscar={buscar}
        tipo="text"
        placeholder="Digite um CEP ou o nome de uma feira..."
        rotulo="Buscar por CEP ou nome da feira"
      />

      {aviso && <Modal titulo="Aviso" descricao={aviso} aoFechar={() => setAviso('')} />}

      <div className={Styles.map}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={14}
          >
            {/* Marcador do usuário (só se aceitar a localização) */}
            {userPosition && (
              <Marker
                position={userPosition}
                title="Você está aqui"
                icon={{
                  // Bolinha azul estilo GPS do Google Maps
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 9,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Marcadores das feiras */}
            {feiras.map((feira) => (
              <Marker
                key={feira.id}
                position={feira.position}
                title={feira.nome}
                onClick={() => setFeiraSelecionada(feira)}
                icon={{
                  url: logoXepa,
                  scaledSize: new window.google.maps.Size(46, 46),
                  anchor: new window.google.maps.Point(23, 23),
                }}
              />
            ))}

            {feiraSelecionada && (
              <InfoWindow
                position={feiraSelecionada.position}
                onCloseClick={() => setFeiraSelecionada(null)}
              >
                <div style={{ padding: '5px', maxWidth: '200px', fontFamily: 'Poppins, sans-serif' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{feiraSelecionada.nome}</h4>
                  <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>{feiraSelecionada.descricao}</p>
                  {feiraSelecionada.dias && (
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666' }}>{feiraSelecionada.dias}</p>
                  )}
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4caf50' }}>{feiraSelecionada.horario}</span>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className={Styles.loading}>Carregando Mapa de Feiras...</div>
        )}
      </div>
    </div>
  );
}

export default MapPage;
