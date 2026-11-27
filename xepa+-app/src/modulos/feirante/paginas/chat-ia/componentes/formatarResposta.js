// Organiza a resposta da Xepinha em parágrafos, passos e tópicos.

const NUMERADO = /^(\d{1,2})[.)]\s+(.*)$/;
const TOPICO = /^[-•*]\s+(.*)$/;
const FRASES_POR_PARAGRAFO = 2;
const PARAGRAFO_LONGO = 280;

// Tira o Markdown que escapar (negrito, títulos) para não aparecer "**" na tela.
function limparMarkdown(texto) {
  return texto
    .replace(/\r/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/^#{1,6}\s*/gm, '');
}

// "Faça assim: 1. Abra 2. Clique" -> cada número em sua linha.
// Só separa quando a linha tem pelo menos dois marcadores, para não quebrar "às 17. Depois".
function separarItensNaMesmaLinha(linha) {
  const numeros = linha.match(/(^|\s)\d{1,2}[.)]\s+\S/g) || [];
  const topicos = linha.match(/(^|\s)[•]\s+\S/g) || [];
  let resultado = linha;

  if (numeros.length < 2 && topicos.length < 2) return [linha];

  if (numeros.length >= 2) resultado = resultado.replace(/\s+(?=\d{1,2}[.)]\s+\S)/g, '\n');
  if (topicos.length >= 2) resultado = resultado.replace(/\s+(?=•\s+\S)/g, '\n');

  // O texto depois do último item vira parágrafo.
  const partes = resultado.split('\n');
  const ultimo = partes.pop();
  // Procura o fim da frase depois do marcador ("3. "), que também tem ponto.
  const marcador = ultimo.match(/^(\d{1,2}[.)]|•)\s+/)?.[0].length || 0;
  const posicao = ultimo.slice(marcador).search(/[.!?]\s+(?=[A-ZÀ-Ú])/);
  const fimDaFrase = posicao === -1 ? -1 : marcador + posicao;

  if (fimDaFrase === -1) return [...partes, ultimo];

  return [...partes, ultimo.slice(0, fimDaFrase + 1), '', ultimo.slice(fimDaFrase + 1).trim()];
}

// Parágrafo muito longo vira vários de poucas frases.
function dividirParagrafo(texto) {
  if (texto.length <= PARAGRAFO_LONGO) return [texto];

  const frases = texto.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [texto];
  const paragrafos = [];

  for (let i = 0; i < frases.length; i += FRASES_POR_PARAGRAFO) {
    paragrafos.push(frases.slice(i, i + FRASES_POR_PARAGRAFO).join('').trim());
  }

  return paragrafos.filter(Boolean);
}

// Retorna [{ tipo: 'paragrafo', texto } | { tipo: 'numerada' | 'topicos', itens: [] }].
export function formatarResposta(texto) {
  const linhas = limparMarkdown(texto)
    .split('\n')
    .flatMap(separarItensNaMesmaLinha)
    .map((linha) => linha.trim());

  const blocos = [];

  // inicio: número do primeiro passo (a lista pode continuar depois de um parágrafo).
  function adicionarItem(tipo, item, inicio = 1) {
    const ultimo = blocos.at(-1);

    if (ultimo?.tipo === tipo) ultimo.itens.push(item);
    else blocos.push({ tipo, itens: [item], inicio });
  }

  for (const linha of linhas) {
    if (!linha) {
      // Linha em branco encerra a lista atual.
      blocos.push({ tipo: 'quebra' });
      continue;
    }

    const numerado = linha.match(NUMERADO);
    const topico = linha.match(TOPICO);

    if (numerado) adicionarItem('numerada', numerado[2], Number(numerado[1]));
    else if (topico) adicionarItem('topicos', topico[1]);
    else dividirParagrafo(linha).forEach((parte) => blocos.push({ tipo: 'paragrafo', texto: parte }));
  }

  return blocos.filter(({ tipo }) => tipo !== 'quebra');
}
