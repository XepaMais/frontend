import { useState, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api'
import Styles from '../estilos/MapU.module.css'
import Modal from '@/compartilhado/componentes/modal/Modal'
import logoXepa from '@/assets/imagens/gerais/logo-colorida.png'
import { GOOGLE_MAPS_LOADER } from '@/compartilhado/servicos/googleMaps'
import BarraPesquisa from '@/compartilhado/componentes/barra-pesquisa/BarraPesquisa'
import { buscarFeirasPorNome, listarFeiras } from '@/modulos/usuario/servicos/feiras'
import { buscarCep, geocodificarEndereco } from '@/compartilhado/servicos/localizacao'
import { carregarTodasFeiras } from '@/modulos/feirante/servicos/feirasFeirante'

const NOMES_DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// De quanto em quanto tempo o mapa busca feiras novas enquanto está aberto.
const ATUALIZAR_A_CADA_MS = 60000;

function temPosicao(feira) {
  return Number.isFinite(feira.position.lat) && Number.isFinite(feira.position.lng);
}

// Feiras do modo demonstração (só neste navegador): já vêm com dias em texto e horário pronto.
function feiraLocalParaMapa(feira) {
  return {
    id: `local-${feira.id}`,
    nome: feira.nome,
    descricao: [feira.endereco || feira.rua, feira.cidade].filter(Boolean).join(' - '),
    dias: (feira.dias || []).length === 7 ? 'Todos os dias' : (feira.dias || []).join(', '),
    horario: feira.horario || '',
    position: { lat: Number(feira.latitude), lng: Number(feira.longitude) },
  };
}

// Mapa geral: todas as feiras da API + as do modo demonstração que ainda não estão na API.
async function carregarFeirasDoMapa() {
  const daApi = (await listarFeiras()).map(feiraParaMapa).filter(temPosicao);
  const idsApi = new Set(daApi.map((feira) => feira.id));
  const locais = carregarTodasFeiras()
    .filter((feira) => !idsApi.has(feira.id) && feira.latitude != null)
    .map(feiraLocalParaMapa)
    .filter(temPosicao);

  return [...daApi, ...locais];
}

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

// Link do Google Maps com a rota até a feira. Sem a posição do usuário, o próprio Google usa a localização atual.
// No celular abre o app do Google Maps (carro, a pé ou transporte público).
function linkDaRota(feira, origem) {
  const parametros = new URLSearchParams({
    api: '1',
    destination: `${feira.position.lat},${feira.position.lng}`,
  });
  if (origem) parametros.set('origin', `${origem.lat},${origem.lng}`);
  return `https://www.google.com/maps/dir/?${parametros}`;
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

  // Todas as feiras cadastradas: quando um feirante adiciona uma feira, ela aparece aqui
  // (ao abrir o mapa, ao voltar para a aba e a cada minuto com a tela aberta).
  const [feiras, setFeiras] = useState([]);

  // Mapa do Google (para enquadrar as feiras) e se a pessoa já mexeu nele (busca ou arrastar).
  const [mapa, setMapa] = useState(null);
  const pessoaMexeu = useRef(false);

  // Ao abrir, enquadra todas as feiras (e a posição do usuário) para os marcadores ficarem à vista.
  // Depois que a pessoa busca ou arrasta o mapa, não mexe mais.
  useEffect(() => {
    if (!mapa || pessoaMexeu.current || feiras.length === 0) return;

    const limites = new window.google.maps.LatLngBounds();
    feiras.forEach((feira) => limites.extend(feira.position));
    if (userPosition) limites.extend(userPosition);
    mapa.fitBounds(limites, 60);
    // Só uma feira: não deixa o zoom chegar perto demais.
    if (feiras.length === 1 && !userPosition) mapa.setZoom(15);
  }, [mapa, feiras.length, userPosition]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let ativo = true;
    let jaAvisou = false;

    const atualizar = () => {
      carregarFeirasDoMapa()
        .then((lista) => {
          if (ativo) setFeiras(lista);
        })
        .catch((erro) => {
          // Avisa só uma vez; nas próximas tentativas mantém as feiras que já estão no mapa.
          if (ativo && !jaAvisou) {
            jaAvisou = true;
            setAviso(erro.message);
          }
        });
    };
    const aoVoltarParaAba = () => {
      if (document.visibilityState === 'visible') atualizar();
    };

    atualizar();
    const relogio = setInterval(aoVoltarParaAba, ATUALIZAR_A_CADA_MS);
    document.addEventListener('visibilitychange', aoVoltarParaAba);

    return () => {
      ativo = false;
      clearInterval(relogio);
      document.removeEventListener('visibilitychange', aoVoltarParaAba);
    };
  }, []);

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

      pessoaMexeu.current = true;
      setFeiraSelecionada(null);
      setMapCenter({ lat: local.latitude, lng: local.longitude });
    } catch {
      setAviso('Não foi possível buscar o CEP agora. Tente novamente.');
    }
  };

  // Procura a feira pelo nome na API (acha também as que acabaram de ser cadastradas),
  // centraliza o mapa nela e abre o balão com os dados. Sem conexão, procura nas que já estão no mapa.
  const buscarFeiraPorNome = async (texto) => {
    const termo = normalizar(texto);
    const combina = (feira) => normalizar(feira.nome).includes(termo);

    let encontrada;
    try {
      encontrada = (await buscarFeirasPorNome(texto)).map(feiraParaMapa).find(temPosicao);
    } catch {
      encontrada = undefined;
    }
    // Feiras do modo demonstração (ou API fora do ar): procura na lista do mapa.
    encontrada = encontrada || feiras.find(combina);

    if (!encontrada) {
      setAviso('Não encontramos nenhuma feira com esse nome.');
      return;
    }

    // Feira nova que ainda não estava no mapa: entra agora.
    pessoaMexeu.current = true;
    setFeiras((atuais) => (atuais.some((feira) => feira.id === encontrada.id) ? atuais : [...atuais, encontrada]));
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
            onLoad={setMapa}
            onUnmount={() => setMapa(null)}
            onDragStart={() => { pessoaMexeu.current = true; }}
          >
            {/* Marcador do usuário (só se aceitar a localização) */}
            {userPosition && (
              <MarkerF
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
              <MarkerF
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
              <InfoWindowF
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
                  <a
                    href={linkDaRota(feiraSelecionada, userPosition)}
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
        ) : (
          <div className={Styles.loading}>Carregando Mapa de Feiras...</div>
        )}
      </div>
    </div>
  );
}

export default MapPage;
