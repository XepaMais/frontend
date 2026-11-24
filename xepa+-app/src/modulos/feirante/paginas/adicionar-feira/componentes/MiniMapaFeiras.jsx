import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'
import { useNavigate } from 'react-router-dom'
import logoXepa from '@/assets/imagens/gerais/logo-colorida.png'
import styles from '@/modulos/feirante/paginas/adicionar-feira/estilos/MiniMapas.module.css'
import { GOOGLE_MAPS_LOADER } from '@/compartilhado/servicos/googleMaps'

const CENTRO_PADRAO = { lat: -23.5505, lng: -46.6333 }; // São Paulo

function MiniMapaFeiras({ feiras }) {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER);

  // Só as feiras que a API conseguiu localizar pelo CEP + número.
  const feirasNoMapa = feiras
    .filter((feira) => feira.latitude != null && feira.longitude != null)
    .map((feira) => ({
      ...feira,
      position: { lat: Number(feira.latitude), lng: Number(feira.longitude) },
    }));
  // Centraliza na feira cadastrada por último, bem perto da rua (como no Google Maps).
  const ultimaFeira = feirasNoMapa[feirasNoMapa.length - 1];

  // Mapa completo dentro da área do feirante (mantém o menu do feirante no topo).
  const abrirMapa = () => navigate('/mapa-feirante');

  if (!isLoaded) return <p>Carregando mapa...</p>;

  return (
    <section className={styles.secaoMiniMapa}>
      <h2 className={`${styles.tituloLista} titulo-cartao`}>Suas Feiras no Mapa:</h2>

      <div className={styles.miniMapa}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={ultimaFeira?.position ?? CENTRO_PADRAO}
          zoom={ultimaFeira ? 16 : 12}
          onClick={abrirMapa}
          options={{
            disableDefaultUI: true,   // esconde botões de zoom etc.
            gestureHandling: 'none',  // não deixa arrastar
            clickableIcons: false,    // ignora pontos do próprio Google
          }}
        >
          {feirasNoMapa.map((feira) => (
            <Marker
              key={feira.id}
              position={feira.position}
              onClick={abrirMapa}
              title={feira.nome}
              icon={{
                url: logoXepa,
                scaledSize: new window.google.maps.Size(48, 48),
                anchor: new window.google.maps.Point(24, 24),
              }}
            />
          ))}
        </GoogleMap>
      </div>

      <button type="button" className={styles.botaoMapa} onClick={abrirMapa}>
        Ver mapa completo
      </button>
    </section>
  );
}

export default MiniMapaFeiras;