import { requisicaoApi, urlDaApi } from '@/compartilhado/servicos/api';
import imagemTalos from '@/assets/imagens/gerais/imagem-talos.jpg';
import imagemRefogados from '@/assets/imagens/gerais/imagem-refogados.jpg';
import imagemVitamina from '@/assets/imagens/gerais/imagem-vitamina.jpg';
import imagemBolo from '@/assets/imagens/gerais/imagem-bolo.jpg';
import imagemSaladaF from '@/assets/imagens/gerais/imagem-saladaF.jpg';
import imagemTomates from '@/assets/imagens/gerais/imagem-tomates.jpg';
import imagemSopaV from '@/assets/imagens/gerais/imagem-sopaV.jpg';
import imagemSopaC from '@/assets/imagens/gerais/imagem-sopaC.jpg';
import imagemSaladaC from '@/assets/imagens/gerais/imagem-saladaC.jpg';

// Foto que vem junto com o site para cada receita (pelo código da receita na API).
const FOTOS_RECEITAS = {
  'salada-caesar': imagemSaladaC,
  'caldo-verde': imagemSopaV,
  'bolo-banana': imagemBolo,
  'talos-salteados': imagemTalos,
  'tomates-recheados': imagemTomates,
  'creme-cenoura': imagemSopaC,
  'salada-frutas': imagemSaladaF,
  'refogado-colorido': imagemRefogados,
  'vitamina-banana-mamao': imagemVitamina,
};

/*
 * Fotos "recortadas" (PNG sem fundo, prato visto de cima) usadas no topo da página.
 * Para adicionar: salve em src/assets/imagens/receitas/<codigo-da-receita>.png ou .webp
 * (ex.: bolo-banana.webp). Sem o PNG, o topo usa a foto normal cortada em círculo.
 */
const RECORTES_RECEITAS = Object.fromEntries(
  Object.entries(import.meta.glob('@/assets/imagens/receitas/*.{png,webp}', { eager: true, import: 'default' })).map(
    ([caminho, url]) => [caminho.split('/').pop().replace(/\.(png|webp)$/, ''), url]
  )
);

/*
 * Receitas completas. "ingredientes" (nomes simples) é usado no filtro "O que você comprou?";
 * "listaIngredientes" e "modoPreparo" aparecem na página da receita.
 * Se a API devolver modo de preparo / quantidades, eles têm prioridade (veja receitaDaApi).
 */
const RECEITAS_BASE = [
  {
    codigo: 'salada-caesar',
    nome: 'Salada caesar',
    categoria: 'Saladas',
    tempo: '15 min',
    rendimento: '4 porções',
    dificuldade: 'Fácil',
    descricao: 'Uma salada fresca e crocante, com molho cremoso e legumes da feira para deixar tudo mais colorido.',
    ingredientes: ['alface', 'tomate', 'cenoura'],
    listaIngredientes: [
      { grupo: 'Salada', itens: [
        '1 pé de alface americana lavado e rasgado',
        '2 tomates maduros em cubos',
        '1 cenoura média ralada',
        '2 fatias de pão amanhecido em cubos',
        '1 colher (sopa) de azeite',
        '3 colheres (sopa) de queijo parmesão ralado',
      ] },
      { grupo: 'Molho', itens: [
        '1 pote de iogurte natural (170 g)',
        '1 colher (sopa) de suco de limão',
        '1 dente de alho amassado',
        '1 colher (chá) de mostarda',
        'Sal e pimenta-do-reino a gosto',
      ] },
    ],
    modoPreparo: [
      'Preaqueça o forno a 200 °C. Espalhe os cubos de pão em uma assadeira, regue com o azeite e asse por cerca de 10 minutos, até dourar. Reserve os croutons.',
      'Em uma tigela, misture o iogurte, o suco de limão, o alho, a mostarda, o sal e a pimenta até formar um molho cremoso.',
      'Em uma saladeira, junte a alface, o tomate e a cenoura ralada.',
      'Na hora de servir, regue com o molho, espalhe os croutons e finalize com o parmesão ralado.',
    ],
    dica: 'Pão amanhecido vira crouton crocante: um jeito simples de não jogar nada fora.',
  },
  {
    codigo: 'caldo-verde',
    nome: 'Caldo verde',
    categoria: 'Sopas',
    tempo: '35 min',
    rendimento: '6 porções',
    dificuldade: 'Fácil',
    descricao: 'O clássico caldo cremoso de batata com couve fininha, perfeito para os dias frios.',
    ingredientes: ['batata', 'couve', 'cebola', 'alho'],
    listaIngredientes: [
      { itens: [
        '6 batatas médias descascadas e picadas',
        '1 maço de couve cortada em tiras bem finas (com os talos picados)',
        '1 cebola picada',
        '3 dentes de alho picados',
        '2 colheres (sopa) de azeite',
        '1,5 litro de água',
        'Sal a gosto',
        'Calabresa em rodelas (opcional)',
      ] },
    ],
    modoPreparo: [
      'Em uma panela, aqueça o azeite e refogue a cebola e o alho até dourarem. Se for usar calabresa, doure junto e retire metade para decorar.',
      'Junte as batatas e os talos da couve picados, cubra com a água, tempere com sal e cozinhe por cerca de 20 minutos, até as batatas ficarem bem macias.',
      'Bata tudo no liquidificador (com cuidado, pois está quente) até virar um creme liso e volte para a panela.',
      'Acrescente a couve em tiras e cozinhe por mais 3 a 5 minutos, só até ela murchar.',
      'Acerte o sal, regue com um fio de azeite e sirva com a calabresa reservada por cima.',
    ],
    dica: 'Os talos da couve dão corpo ao caldo: bata junto com as batatas em vez de descartar.',
  },
  {
    codigo: 'bolo-banana',
    nome: 'Bolo de banana',
    categoria: 'Doces',
    tempo: '45 min',
    rendimento: '12 fatias',
    dificuldade: 'Média',
    descricao: 'Bolo fofinho que aproveita aquelas bananas bem maduras, com aveia e um toque de canela.',
    ingredientes: ['banana', 'aveia', 'canela', 'ovo'],
    listaIngredientes: [
      { grupo: 'Massa', itens: [
        '4 bananas bem maduras',
        '3 ovos',
        '1/2 xícara (chá) de óleo',
        '1 xícara (chá) de açúcar mascavo',
        '1 xícara (chá) de farinha de trigo',
        '1 xícara (chá) de aveia em flocos',
        '1 colher (sopa) de fermento em pó',
      ] },
      { grupo: 'Cobertura', itens: [
        '1 banana em rodelas',
        '1 colher (sopa) de açúcar',
        '1 colher (chá) de canela em pó',
      ] },
    ],
    modoPreparo: [
      'Preaqueça o forno a 180 °C e unte uma forma com óleo e farinha.',
      'No liquidificador, bata as bananas, os ovos, o óleo e o açúcar mascavo até ficar homogêneo.',
      'Passe para uma tigela e misture a farinha e a aveia aos poucos. Por último, acrescente o fermento, mexendo delicadamente.',
      'Despeje a massa na forma e distribua as rodelas de banana por cima. Polvilhe a mistura de açúcar e canela.',
      'Asse por 35 a 40 minutos, ou até que um palito saia limpo. Espere amornar antes de desenformar.',
    ],
    dica: 'Quanto mais pintada a casca da banana, mais doce e úmido fica o bolo.',
  },
  {
    codigo: 'talos-salteados',
    nome: 'Talos salteados com alho',
    categoria: 'Aproveitamento integral',
    tempo: '20 min',
    rendimento: '4 porções',
    dificuldade: 'Fácil',
    descricao: 'Acompanhamento rápido feito com talos que normalmente iriam para o lixo.',
    ingredientes: ['couve', 'alho', 'cenoura', 'brócolis'],
    listaIngredientes: [
      { itens: [
        '2 xícaras (chá) de talos picados (couve, brócolis, beterraba ou espinafre)',
        '1 cenoura com casca em palitos finos',
        '4 dentes de alho fatiados',
        '2 colheres (sopa) de azeite',
        '1 colher (sopa) de shoyu (opcional)',
        'Sal e pimenta-do-reino a gosto',
        'Cheiro-verde picado para finalizar',
      ] },
    ],
    modoPreparo: [
      'Lave bem os talos e corte em pedaços pequenos e de tamanho parecido, para cozinharem por igual.',
      'Em uma frigideira grande, aqueça o azeite em fogo baixo e doure o alho fatiado, sem deixar queimar.',
      'Aumente o fogo, junte os talos e a cenoura e salteie por 6 a 8 minutos, mexendo sempre, até ficarem macios mas ainda crocantes.',
      'Tempere com sal, pimenta e o shoyu, se quiser. Finalize com cheiro-verde e sirva em seguida.',
    ],
    dica: 'Fica ótimo como recheio de omelete ou misturado ao arroz no dia seguinte.',
  },
  {
    codigo: 'tomates-recheados',
    nome: 'Tomates recheados',
    categoria: 'Rápidas',
    tempo: '25 min',
    rendimento: '4 porções',
    dificuldade: 'Média',
    descricao: 'Tomates assados com recheio de arroz e queijo: um jeito gostoso de usar a sobra do almoço.',
    ingredientes: ['tomate', 'arroz', 'queijo', 'cebola'],
    listaIngredientes: [
      { itens: [
        '4 tomates grandes e firmes',
        '1 xícara (chá) de arroz cozido (pode ser sobra)',
        '1/2 cebola picada',
        '1 dente de alho picado',
        '1/2 xícara (chá) de queijo muçarela ralado',
        '2 colheres (sopa) de parmesão ralado',
        '1 colher (sopa) de azeite',
        'Sal, orégano e cheiro-verde a gosto',
      ] },
    ],
    modoPreparo: [
      'Preaqueça o forno a 200 °C. Corte uma tampa de cada tomate e retire a polpa com uma colher, sem furar o fundo. Pique a polpa e reserve.',
      'Em uma frigideira, aqueça o azeite e refogue a cebola e o alho. Junte a polpa do tomate e cozinhe por 3 minutos.',
      'Acrescente o arroz, a muçarela, o sal, o orégano e o cheiro-verde e misture bem.',
      'Recheie os tomates, polvilhe o parmesão e coloque em uma assadeira untada.',
      'Asse por cerca de 15 minutos, até o queijo gratinar. Sirva quente.',
    ],
    dica: 'Nada da polpa vai fora: ela vira parte do molho do recheio.',
  },
  {
    codigo: 'creme-cenoura',
    nome: 'Creme de cenoura',
    categoria: 'Sopas',
    tempo: '30 min',
    rendimento: '4 porções',
    dificuldade: 'Fácil',
    descricao: 'Sopa aveludada, adocicada e levemente picante por causa do gengibre.',
    ingredientes: ['cenoura', 'batata', 'gengibre', 'cebola'],
    listaIngredientes: [
      { itens: [
        '5 cenouras médias com casca, picadas',
        '1 batata média picada',
        '1 cebola picada',
        '2 dentes de alho',
        '1 colher (chá) de gengibre ralado',
        '1 colher (sopa) de azeite ou manteiga',
        '1 litro de água ou caldo de legumes',
        'Sal a gosto',
        'Cheiro-verde e sementes para finalizar',
      ] },
    ],
    modoPreparo: [
      'Em uma panela, aqueça o azeite e refogue a cebola, o alho e o gengibre por 2 minutos.',
      'Junte a cenoura e a batata, refogue rapidamente e cubra com a água ou o caldo. Tempere com sal.',
      'Cozinhe com a panela semitampada por cerca de 20 minutos, até os legumes ficarem bem macios.',
      'Bata no liquidificador até obter um creme liso. Volte para a panela e ajuste a consistência com um pouco de água, se precisar.',
      'Sirva com cheiro-verde picado e sementes tostadas por cima.',
    ],
    dica: 'Lave bem e use a cenoura com casca: ela tem mais nutrientes e dá mais cor ao creme.',
  },
  {
    codigo: 'salada-frutas',
    nome: 'Salada de frutas da estação',
    categoria: 'Doces',
    tempo: '12 min',
    rendimento: '6 porções',
    dificuldade: 'Fácil',
    descricao: 'Sobremesa leve e colorida com as frutas mais fresquinhas da feira.',
    ingredientes: ['banana', 'mamão', 'laranja', 'maçã'],
    listaIngredientes: [
      { itens: [
        '2 bananas em rodelas',
        '1/2 mamão em cubos',
        '1 maçã em cubos',
        '1 xícara (chá) de uvas ou morangos',
        'Suco de 2 laranjas',
        '1 colher (sopa) de mel (opcional)',
        'Folhas de hortelã para decorar',
      ] },
    ],
    modoPreparo: [
      'Lave bem todas as frutas. Descasque as que forem necessárias e corte em cubos de tamanho parecido.',
      'Coloque a maçã e a banana primeiro na tigela e regue com o suco de laranja, para não escurecerem.',
      'Junte as demais frutas e o mel, se usar, e misture delicadamente.',
      'Leve à geladeira por pelo menos 10 minutos e sirva decorada com hortelã.',
    ],
    dica: 'Use as frutas mais maduras da fruteira: na salada elas ficam ainda mais doces.',
  },
  {
    codigo: 'refogado-colorido',
    nome: 'Refogado colorido',
    categoria: 'Aproveitamento integral',
    tempo: '18 min',
    rendimento: '4 porções',
    dificuldade: 'Fácil',
    descricao: 'Mistura de legumes refogados que aproveita cascas, talos e o que sobrou na geladeira.',
    ingredientes: ['cenoura', 'couve', 'cebola', 'abobrinha'],
    listaIngredientes: [
      { itens: [
        '1 cenoura com casca em cubinhos',
        '1 abobrinha em cubos',
        '1/2 pimentão picado',
        '4 folhas de couve em tiras (com os talos picados)',
        '1 cebola em pétalas',
        '2 dentes de alho picados',
        '2 colheres (sopa) de azeite',
        'Sal, páprica e pimenta a gosto',
      ] },
    ],
    modoPreparo: [
      'Aqueça o azeite em uma frigideira grande e refogue a cebola e o alho até ficarem transparentes.',
      'Adicione a cenoura e os talos da couve, que demoram mais para cozinhar, e refogue por 5 minutos.',
      'Junte a abobrinha e o pimentão e cozinhe por mais 4 minutos, mexendo de vez em quando.',
      'Por último, acrescente a couve em tiras, tempere com sal, páprica e pimenta e desligue assim que ela murchar.',
    ],
    dica: 'Vale qualquer legume que estiver sobrando: chuchu, vagem e berinjela também combinam.',
  },
  {
    codigo: 'vitamina-banana-mamao',
    nome: 'Vitamina de banana e mamão',
    categoria: 'Sucos',
    tempo: '5 min',
    rendimento: '2 copos',
    dificuldade: 'Fácil',
    descricao: 'Vitamina cremosa e nutritiva para o café da manhã ou o lanche da tarde.',
    ingredientes: ['banana', 'mamão', 'leite', 'aveia'],
    listaIngredientes: [
      { itens: [
        '1 banana madura',
        '1 fatia grande de mamão (cerca de 200 g)',
        '400 ml de leite gelado (ou bebida vegetal)',
        '2 colheres (sopa) de aveia em flocos',
        '1 colher (sopa) de mel (opcional)',
        'Gelo a gosto',
      ] },
    ],
    modoPreparo: [
      'Descasque a banana e retire as sementes e a casca do mamão.',
      'Coloque todos os ingredientes no liquidificador.',
      'Bata por cerca de 1 minuto, até ficar bem cremoso.',
      'Sirva em seguida, bem gelado.',
    ],
    dica: 'Banana e mamão muito maduros podem ser congelados em pedaços e usados direto na vitamina.',
  },
];

export const RECEITAS_PADRAO = RECEITAS_BASE.map((receita) => ({
  ...receita,
  imagem: FOTOS_RECEITAS[receita.codigo],
  recorte: RECORTES_RECEITAS[receita.codigo] || '',
}));

const RECEITAS_POR_CODIGO = Object.fromEntries(RECEITAS_PADRAO.map((receita) => [receita.codigo, receita]));

const DIFICULDADES = { FACIL: 'Fácil', MEDIA: 'Média', DIFICIL: 'Difícil' };

// "Modo de preparo" da API pode vir como texto (um passo por linha) ou como lista.
function passosDoPreparo(modoPreparo) {
  if (Array.isArray(modoPreparo)) return modoPreparo.filter(Boolean);
  if (typeof modoPreparo !== 'string') return [];
  return modoPreparo
    .split(/\r?\n/)
    .map((linha) => linha.replace(/^\s*\d+[.)-]\s*/, '').trim())
    .filter(Boolean);
}

// Ingredientes da API podem vir como texto ("tomate") ou objeto ({ nome, quantidade }).
function nomeDoIngrediente(item) {
  return typeof item === 'string' ? item : item?.nome || item?.nomeIngrediente || '';
}

function textoDoIngrediente(item) {
  if (typeof item === 'string') return item;
  const nome = nomeDoIngrediente(item);
  const quantidade = item?.quantidade || item?.quantidadeIngrediente;
  return quantidade ? `${quantidade} de ${nome}` : nome;
}

// Receita da API -> formato do site. O que a API não tiver vem da receita local de mesmo código.
export function receitaDaApi(receita) {
  const local = RECEITAS_POR_CODIGO[receita.codigo] || {};
  const ingredientesApi = Array.isArray(receita.ingredientes) ? receita.ingredientes : [];
  const passosApi = passosDoPreparo(receita.modoPreparo);
  const apiTemQuantidades = ingredientesApi.some((item) => typeof item === 'object' && (item.quantidade || item.quantidadeIngrediente));

  return {
    ...local,
    codigo: receita.codigo,
    nome: receita.nome || local.nome,
    categoria: receita.categoria || local.categoria,
    tempo: receita.tempoMinutos ? `${receita.tempoMinutos} min` : local.tempo || '',
    rendimento: receita.rendimento || local.rendimento || '',
    dificuldade: DIFICULDADES[receita.dificuldade] || receita.dificuldade || local.dificuldade || '',
    descricao: receita.descricao || local.descricao || '',
    ingredientes: ingredientesApi.length ? ingredientesApi.map(nomeDoIngrediente).filter(Boolean) : local.ingredientes || [],
    listaIngredientes:
      apiTemQuantidades || !local.listaIngredientes
        ? [{ itens: ingredientesApi.map(textoDoIngrediente).filter(Boolean) }]
        : local.listaIngredientes,
    modoPreparo: passosApi.length ? passosApi : local.modoPreparo || [],
    imagem: urlDaApi(receita.imagem) || local.imagem || FOTOS_RECEITAS[receita.codigo],
    recorte: RECORTES_RECEITAS[receita.codigo] || '',
  };
}

// Lista de receitas (API, ou a lista local se a API estiver fora do ar).
export async function buscarReceitas() {
  try {
    const lista = await requisicaoApi('/receitas');
    return Array.isArray(lista) && lista.length ? lista.map(receitaDaApi) : RECEITAS_PADRAO;
  } catch {
    return RECEITAS_PADRAO;
  }
}

export function receitaLocal(codigo) {
  return RECEITAS_POR_CODIGO[codigo] || null;
}

// Endereço da página da receita, mantendo o "lado" do site (/cozinha ou /cozinha-home).
export function caminhoDaReceita(pathname, codigo) {
  const base = pathname.startsWith('/cozinha-home') ? '/cozinha-home' : '/cozinha';
  return `${base}/${codigo}`;
}
