import { useState } from 'react';
import { Bike, Home, MapPin, Store } from 'lucide-react';
import { buscarCep } from '@/compartilhado/servicos/localizacao';
import { ENTREGA_CASA, formatarMoeda, RETIRADA_FEIRA } from '@/compartilhado/servicos/pedidos';
import { formatarDistancia, TABELA_FRETE } from '@/modulos/usuario/servicos/frete';
import Styles from '../estilos/EscolhaRecebimento.module.css';

// Deixa o CEP no formato 00000-000 enquanto a pessoa digita.
function mascararCep(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 8);
  return numeros.length > 5 ? `${numeros.slice(0, 5)}-${numeros.slice(5)}` : numeros;
}

// Lista sem repetição das feiras/bancas onde os itens do carrinho são retirados.
function locaisDeRetirada(itens) {
  const locais = [];

  for (const item of itens) {
    const nome = item.feira || item.barraca || 'Local de retirada';
    const jaTem = locais.some((local) => local.nome === nome && local.endereco === item.local);

    if (!jaTem) {
      locais.push({ nome, endereco: item.local });
    }
  }

  return locais;
}

// Escolha entre retirar na feira ou receber em casa (com endereço pelo CEP).
export default function EscolhaRecebimento({
  itens,
  recebimento,
  onChange,
  mostrarErros,
  frete,
  calculandoFrete,
}) {
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState('');
  const { tipo, endereco } = recebimento;

  function escolherTipo(novoTipo) {
    onChange({ ...recebimento, tipo: novoTipo });
  }

  function alterarEndereco(campo, valor) {
    onChange({ ...recebimento, endereco: { ...endereco, [campo]: valor } });
  }

  async function alterarCep(valor) {
    const cep = mascararCep(valor);
    alterarEndereco('cep', cep);
    setErroCep('');

    if (cep.length !== 9) return;

    setBuscandoCep(true);

    try {
      const dados = await buscarCep(cep);

      if (dados) {
        onChange({ ...recebimento, endereco: { ...endereco, cep, ...dados } });
      } else {
        setErroCep('CEP não encontrado. Preencha o endereço manualmente.');
      }
    } catch {
      setErroCep('Não foi possível buscar o CEP agora. Preencha o endereço manualmente.');
    } finally {
      setBuscandoCep(false);
    }
  }

  // Marca o campo em vermelho quando a pessoa tenta pagar sem preencher.
  function classeCampo(valor) {
    return mostrarErros && !valor.trim() ? `${Styles.campo} ${Styles.campoErro}` : Styles.campo;
  }

  return (
    <section className={Styles.recebimento} aria-labelledby="titulo-recebimento">
      <h4 id="titulo-recebimento">Como você quer receber?</h4>

      <div className={Styles.opcoes} role="radiogroup" aria-label="Forma de recebimento">
        <button
          type="button"
          role="radio"
          aria-checked={tipo === RETIRADA_FEIRA}
          className={tipo === RETIRADA_FEIRA ? `${Styles.opcao} ${Styles.opcaoAtiva}` : Styles.opcao}
          onClick={() => escolherTipo(RETIRADA_FEIRA)}
        >
          <Store size={22} aria-hidden="true" />
          <span>
            <strong>Retirar na feira</strong>
            <small>Grátis</small>
          </span>
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={tipo === ENTREGA_CASA}
          className={tipo === ENTREGA_CASA ? `${Styles.opcao} ${Styles.opcaoAtiva}` : Styles.opcao}
          onClick={() => escolherTipo(ENTREGA_CASA)}
        >
          <Home size={22} aria-hidden="true" />
          <span>
            <strong>Receber em casa</strong>
            <small>Taxa pela distância</small>
          </span>
        </button>
      </div>

      {tipo === RETIRADA_FEIRA ? (
        <div className={Styles.detalhe}>
          <p className={Styles.legenda}>Retire na feira/banca:</p>
          <ul className={Styles.locais}>
            {locaisDeRetirada(itens).map((local) => (
              <li key={`${local.nome}-${local.endereco}`}>
                <MapPin size={18} aria-hidden="true" />
                <span>
                  <strong>{local.nome}</strong>
                  {local.endereco && <small>{local.endereco}</small>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={Styles.detalhe}>
          <p className={Styles.legenda}>Endereço de entrega</p>

          <div className={Styles.grade}>
            <label className={Styles.metade}>
              CEP
              <input
                className={classeCampo(endereco.cep.length === 9 ? endereco.cep : '')}
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                value={endereco.cep}
                onChange={(evento) => alterarCep(evento.target.value)}
              />
            </label>
            <span className={`${Styles.metade} ${Styles.avisoCep}`} aria-live="polite">
              {buscandoCep ? 'Buscando endereço...' : erroCep}
            </span>

            <label className={Styles.inteiro}>
              Rua
              <input
                className={classeCampo(endereco.logradouro)}
                autoComplete="address-line1"
                value={endereco.logradouro}
                onChange={(evento) => alterarEndereco('logradouro', evento.target.value)}
              />
            </label>

            <label className={Styles.metade}>
              Número
              <input
                className={classeCampo(endereco.numero)}
                value={endereco.numero}
                onChange={(evento) => alterarEndereco('numero', evento.target.value)}
              />
            </label>

            <label className={Styles.metade}>
              Complemento
              <input
                className={Styles.campo}
                placeholder="Opcional"
                autoComplete="address-line2"
                value={endereco.complemento}
                onChange={(evento) => alterarEndereco('complemento', evento.target.value)}
              />
            </label>

            <label className={Styles.inteiro}>
              Bairro
              <input
                className={classeCampo(endereco.bairro)}
                value={endereco.bairro}
                onChange={(evento) => alterarEndereco('bairro', evento.target.value)}
              />
            </label>

            <label className={Styles.cidade}>
              Cidade
              <input
                className={classeCampo(endereco.cidade)}
                autoComplete="address-level2"
                value={endereco.cidade}
                onChange={(evento) => alterarEndereco('cidade', evento.target.value)}
              />
            </label>

            <label className={Styles.uf}>
              UF
              <input
                className={classeCampo(endereco.uf)}
                maxLength={2}
                autoComplete="address-level1"
                value={endereco.uf}
                onChange={(evento) => alterarEndereco('uf', evento.target.value.toUpperCase())}
              />
            </label>
          </div>

          {mostrarErros && (
            <p className={Styles.erro} role="alert">
              Preencha o endereço de entrega para continuar.
            </p>
          )}

          {/* Taxa de entrega de cada feira até o endereço */}
          <div className={Styles.frete} aria-live="polite">
            <p className={Styles.legenda}>
              <Bike size={18} aria-hidden="true" /> Entrega
            </p>

            {!frete && !calculandoFrete && (
              <p className={Styles.freteAviso}>
                Preencha o endereço para calcular a taxa de entrega.
              </p>
            )}

            {calculandoFrete && (
              <p className={Styles.freteAviso}>Calculando a distância até a feira...</p>
            )}

            {frete && (
              <ul className={Styles.freteLista}>
                {frete.entregas.map((entregaFeira) => (
                  <li key={entregaFeira.feira}>
                    <span>
                      <strong>{entregaFeira.feira}</strong>
                      <small>
                        {formatarDistancia(entregaFeira.distanciaKm)}
                        {!entregaFeira.foraDoRaio
                          && ` • ${entregaFeira.tempo.minimo}-${entregaFeira.tempo.maximo} min`}
                      </small>
                    </span>
                    <strong className={entregaFeira.foraDoRaio ? Styles.foraDoRaio : ''}>
                      {entregaFeira.foraDoRaio ? 'Não entrega' : formatarMoeda(entregaFeira.valor)}
                    </strong>
                  </li>
                ))}
              </ul>
            )}

            {frete?.foraDoRaio && (
              <p className={Styles.erro} role="alert">
                Uma das feiras fica a mais de {TABELA_FRETE.raioMaximoKm} km. Escolha retirar
                na feira ou remova o item do carrinho.
              </p>
            )}

            <p className={Styles.freteTabela}>
              {formatarMoeda(TABELA_FRETE.taxaBase)} até {TABELA_FRETE.kmInclusos} km
              {' + '}
              {formatarMoeda(TABELA_FRETE.valorPorKm)} por km adicional.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
