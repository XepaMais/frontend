import { useState, useEffect } from 'react'
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'
import Styles from '../estilos/MapU.module.css'
import Modal from '@/compartilhado/componentes/modal/Modal'
import logoXepa from '@/assets/imagens/gerais/logo-colorida.png'
import { GOOGLE_MAPS_LOADER } from '@/compartilhado/servicos/googleMaps'
import BarraPesquisa from '@/compartilhado/componentes/barra-pesquisa/BarraPesquisa';

import { buscarFeirasDoMapa } from '@/modulos/feirante/servicos/feirasFeirante';

// Texto do balão: dias e horário que o feirante cadastrou.
function descreverFuncionamento(feira) {
  return [feira.dias?.join(', '), feira.horario].filter(Boolean).join(' · ');
}

function MapPage() {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER);

  const [cep, setCep] = useState('');
  const [aviso, setAviso] = useState('');
  // Feiras cadastradas pelos feirantes (banco na nuvem), já com coordenadas.
  const [feirasCadastradas, setFeirasCadastradas] = useState([]);

  useEffect(() => {
    buscarFeirasDoMapa()
      .then((feiras) =>
        setFeirasCadastradas(
          feiras.map((feira) => ({
            ...feira,
            descricao: [feira.endereco, feira.cidade].filter(Boolean).join(', '),
            horario: descreverFuncionamento(feira),
            position: { lat: Number(feira.latitude), lng: Number(feira.longitude) },
          })),
        ),
      )
      .catch(() => setAviso('Não foi possível carregar as feiras agora.'));
  }, []);

  const [feiraSelecionada, setFeiraSelecionada] = useState(null);
  
  // O centro do mapa começa na posição padrão, mas mudará para a do usuário
  const [mapCenter, setMapCenter] = useState({
    lat: -23.5280859,
    lng: -46.6917602,
  });

  // ESTADO NOVO: Armazena a posição GPS real capturada do usuário
  const [userPosition, setUserPosition] = useState(null);

  // PEGAR A POSIÇÃO ATUAL AUTOMATICAMENTE AO ABRIR A TELA
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

  // Busca por CEP caso o usuário queira pesquisar outra região
  const buscarRegiaoPorCep = () => {
    if (!cep.trim()) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { 
        address: cep,
        componentRestrictions: { country: 'BR' } 
      }, 
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const coords = results[0].geometry.location;
          setMapCenter({
            lat: coords.lat(),
            lng: coords.lng(),
          });
        } else {
          setAviso('Não encontramos este CEP. Tente novamente.');
        }
      }
    );
  };

  return (
    <div className={Styles.pageContainer}>
      
      <BarraPesquisa
        className={Styles.searchForm}
        valor={cep}
        aoMudar={setCep}
        aoBuscar={buscarRegiaoPorCep}
        tipo="text"
        placeholder="Digite um CEP para buscar outra região..."
        rotulo="CEP para buscar outra região"
      />

      {aviso && <Modal titulo="Aviso" descricao={aviso} aoFechar={() => setAviso('')} />}

      <div className={Styles.map}>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={mapCenter}
            zoom={14}
          >
            {/* MARCADOR DO USUÁRIO (Aparece apenas se ele aceitar a geolocalização) */}
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

            {/* MARCADORES DAS FEIRAS (Logos da Xepa) */}
            {feirasCadastradas.map((feira) => (
              <Marker
                key={feira.id}
                position={feira.position}
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
