import { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import logoXepa from '@/assets/imagens/gerais/logo-colorida.png';
import { GOOGLE_MAPS_LOADER } from '@/compartilhado/servicos/googleMaps';

// Rota no Google Maps até a feira (o Google usa a localização atual da pessoa como partida).
function linkDaRota(feira) {
  const parametros = new URLSearchParams({ api: '1', destination: `${feira.latitude},${feira.longitude}` });
  return `https://www.google.com/maps/dir/?${parametros}`;
}

function horarioDa(feira) {
  const inicio = feira.horarioInicio?.slice(0, 5);
  const fim = feira.horarioFim?.slice(0, 5);
  return inicio && fim ? `${inicio} às ${fim}` : '';
}

// Mapa da home: pino vermelho no ponto buscado e o logo da Xepa em cada feira cadastrada.
function MapaFeirasHome({ centro, feiras }) {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER);
  const [selecionada, setSelecionada] = useState(null);

  if (!isLoaded) return null;

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={centro}
      zoom={14}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {/* Ponto buscado (ou o centro padrão ao abrir) */}
      <MarkerF position={centro} title="Local pesquisado" />

      {feiras.map((feira) => (
        <MarkerF
          key={feira.id}
          position={{ lat: feira.latitude, lng: feira.longitude }}
          title={feira.nome}
          onClick={() => setSelecionada(feira)}
          icon={{
            url: logoXepa,
            scaledSize: new window.google.maps.Size(40, 40),
            anchor: new window.google.maps.Point(20, 20),
          }}
        />
      ))}

      {selecionada && (
        <InfoWindowF
          position={{ lat: selecionada.latitude, lng: selecionada.longitude }}
          onCloseClick={() => setSelecionada(null)}
        >
          <div style={{ padding: '5px', maxWidth: '200px', fontFamily: 'Poppins, sans-serif' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{selecionada.nome}</h4>
            <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#666' }}>
              {[selecionada.endereco, selecionada.cidade].filter(Boolean).join(' - ')}
            </p>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#4caf50' }}>{horarioDa(selecionada)}</span>
            <a
              href={linkDaRota(selecionada)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: '8px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: '#FF5200',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Como chegar
            </a>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}

export default MapaFeirasHome;