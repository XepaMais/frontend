// Dados da demonstração. Ao escolher um perfil na tela /demo, o navegador é preenchido com:
// - 3 feirantes fictícios (um por plano), cada um com feiras reais da Freguesia do Ó,
//   Brasilândia e Pirituba (endereços reais, cadastro do feirante inventado);
// - xepas à venda e esgotadas, pedidos, conversas, rendas, despesas e saques;
// - um consumidor que já comprou dos três feirantes.
// As datas são relativas a hoje, para o financeiro sempre ter "hoje", "semana" e "mês" preenchidos.
// Entrar de novo na demonstração recomeça tudo do zero.
import { PLANOS } from '@/compartilhado/dados/planos';
import { dataEmTexto } from '@/compartilhado/servicos/datas';
import legumesFeira from '@/assets/imagens/xepas-demo/legumesFeira.jpg';
import tomateCebola from '@/assets/imagens/xepas-demo/tomateCebola.jpg';
import bananas from '@/assets/imagens/xepas-demo/bananas.jpg';
import coentro from '@/assets/imagens/xepas-demo/coentro.jpg';
import legumesSortidos from '@/assets/imagens/xepas-demo/legumesSortidos.jpg';
import alface from '@/assets/imagens/xepas-demo/alface.jpg';
import abobora from '@/assets/imagens/xepas-demo/abobora.jpg';
import morangos from '@/assets/imagens/xepas-demo/morangos.jpg';
import manjericao from '@/assets/imagens/xepas-demo/manjericao.jpg';
import brocolisCouveFlor from '@/assets/imagens/xepas-demo/brocolisCouveFlor.jpg';
import frutasTropicais from '@/assets/imagens/xepas-demo/frutasTropicais.jpg';
import cestaLegumes from '@/assets/imagens/xepas-demo/cestaLegumes.jpg';
import tomates from '@/assets/imagens/xepas-demo/tomates.jpg';
import alfaceCrespa from '@/assets/imagens/xepas-demo/alfaceCrespa.jpg';
import gengibre from '@/assets/imagens/xepas-demo/gengibre.jpg';

// ---------- Fotos das xepas ----------
// Fotos reais do Wikimedia Commons (licenças livres), salvas em src/assets/imagens/xepas-demo.
// Créditos:
// - legumesFeira.jpg: Legumes e verduras da Feira Livre de Jacobina (CC BY-SA 4.0)
// - tomateCebola.jpg: Tomatoes and Onions at a Farmers Market (CC0)
// - bananas.jpg: Fresh Banana and Coconut Fruit Stall (CC BY-SA 4.0)
// - coentro.jpg: Bunches of coriander leaves (CC BY-SA 4.0)
// - legumesSortidos.jpg: Burnie Farmers Market Veges (CC0)
// - alface.jpg: Lettuce at Fruit Garden Market, Port Harcourt (CC BY 4.0)
// - abobora.jpg: Squashes on Gomel Market (CC BY-SA 4.0)
// - morangos.jpg: Strawberries at Ljubljana Central Market (CC BY 4.0)
// - manjericao.jpg: Fresh green basil leaves (CC BY 4.0)
// - brocolisCouveFlor.jpg: Colorful winter Vegetables (CC0)
// - frutasTropicais.jpg: Mango, papaya arequipena, banana (CC BY 2.0)
// - cestaLegumes.jpg: Eagle hill garden (CC BY-SA 2.0)
// - tomates.jpg: Tomate Carmem (CC0)
// - alfaceCrespa.jpg: Lettuce (fancy), Harbourside Market, Wellington (CC0)
// - gengibre.jpg: Spring onions, garlic, and ginger (CC BY 2.0)
const FOTOS = {
  legumesFeira,
  tomateCebola,
  bananas,
  coentro,
  legumesSortidos,
  alface,
  abobora,
  morangos,
  manjericao,
  brocolisCouveFlor,
  frutasTropicais,
  cestaLegumes,
  tomates,
  alfaceCrespa,
  gengibre,
};

// ---------- Datas ----------

function diasAtras(dias, hora = 9, minuto = 0) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  data.setHours(hora, minuto, 0, 0);
  return data;
}

function diasAFrente(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return dataEmTexto(data);
}

// Últimas ocorrências (até 45 dias atrás) dos dias da semana da feira. 0 = domingo.
const NUMERO_DIA = { Dom: 0, Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sáb: 6 };

function diasDeFeira(dias, limite = 45) {
  const resultado = [];
  for (let atras = 0; atras <= limite; atras += 1) {
    if (dias.some((dia) => NUMERO_DIA[dia] === diasAtras(atras).getDay())) resultado.push(atras);
  }
  return resultado;
}

// Sorteio sempre igual (a demonstração fica a mesma toda vez).
function criarSorteio(semente) {
  let estado = semente;
  return () => {
    estado = (estado * 9301 + 49297) % 233280;
    return estado / 233280;
  };
}

const centavos = (valor) => Math.round(valor * 100) / 100;

// ---------- Feiras reais (cadastro dos feirantes é fictício) ----------

const FEIRAS = {
  brasilandia: {
    id: 1730000000101,
    nome: 'Feira da Vila Brasilândia',
    rua: 'Rua Maria Nazaro da Silva',
    numero: '224',
    cep: '02809-030',
    cidade: 'São Paulo - SP',
    latitude: -23.4719429,
    longitude: -46.7052729,
    dias: ['Sáb'],
    horarioInicio: '07:00',
    horarioFim: '13:00',
  },
  laranjeiras: {
    id: 1730000000102,
    nome: 'Feira da Rua Laranjeiras do Sul',
    rua: 'Rua Laranjeiras do Sul',
    numero: 's/n',
    cep: '02812-050',
    cidade: 'São Paulo - SP',
    latitude: -23.4599787,
    longitude: -46.7177952,
    dias: ['Qua'],
    horarioInicio: '07:00',
    horarioFim: '12:30',
  },
  bertucci: {
    id: 1730000000201,
    nome: 'Feira da Freguesia do Ó - Bruno Bertucci',
    rua: 'Rua Bruno Bertucci',
    numero: '200',
    cep: '02910-055',
    cidade: 'São Paulo - SP',
    latitude: -23.5035342,
    longitude: -46.7000593,
    dias: ['Sex'],
    horarioInicio: '07:00',
    horarioFim: '13:00',
  },
  chicoDePaula: {
    id: 1730000000202,
    nome: 'Feira da Freguesia do Ó - Chico de Paula',
    rua: 'Rua Chico de Paula',
    numero: 's/n',
    cep: '02926-000',
    cidade: 'São Paulo - SP',
    latitude: -23.4992037,
    longitude: -46.6985802,
    dias: ['Ter'],
    horarioInicio: '07:00',
    horarioFim: '12:30',
  },
  jurubim: {
    id: 1730000000301,
    nome: 'Feira de Pirituba - Rua Jurubim',
    rua: 'Rua Jurubim',
    numero: '10',
    cep: '05159-200',
    cidade: 'São Paulo - SP',
    latitude: -23.4840073,
    longitude: -46.7513939,
    dias: ['Sáb'],
    horarioInicio: '06:30',
    horarioFim: '13:00',
  },
  anastacio: {
    id: 1730000000302,
    nome: 'Feira de Pirituba - Av. do Anastácio',
    rua: 'Avenida do Anastácio',
    numero: 's/n',
    cep: '05138-100',
    cidade: 'São Paulo - SP',
    latitude: -23.4865508,
    longitude: -46.7380904,
    dias: ['Dom'],
    horarioInicio: '07:00',
    horarioFim: '13:30',
  },
};

function montarFeira(feira, funcionarios) {
  return {
    ...feira,
    endereco: `${feira.rua}, ${feira.numero}`,
    horario: `${feira.horarioInicio} às ${feira.horarioFim}`,
    funcionarios,
  };
}

// ---------- Feirantes fictícios ----------

const FEIRANTES = {
  gratis: {
    dono: 'demo-semente',
    perfil: {
      nome: 'Sebastião Ferreira',
      cpf: '284.517.936-04',
      telefone: '(11) 98472-3615',
      nascimento: '1968-04-12',
      email: 'tiao.hortifruti@exemplo.com.br',
      foto: '',
      matricula: '012.345-6',
      validade: '31/03/2027',
      cnpj: '',
      ccm: '',
      titular: 'Sebastião Ferreira',
      barraca: 'Hortifruti do Tião',
      grupo: 'Hortifrutícola',
    },
    feiras: [montarFeira(FEIRAS.brasilandia, ['Cláudia'])],
    vendaNaFeira: [380, 620],
  },
  crescer: {
    dono: 'demo-broto',
    perfil: {
      nome: 'Rosângela Matos',
      cpf: '371.802.645-19',
      telefone: '(11) 97315-8240',
      nascimento: '1979-09-23',
      email: 'rosangela.verdes@exemplo.com.br',
      foto: '',
      matricula: '027.918-3',
      validade: '30/06/2027',
      cnpj: '41.283.507/0001-62',
      ccm: '7.284.519-0',
      titular: 'Rosângela Matos',
      barraca: 'Verdes da Rô',
      grupo: 'Hortifrutícola',
    },
    feiras: [
      montarFeira(FEIRAS.chicoDePaula, ['Diego', 'Patrícia']),
      montarFeira(FEIRAS.bertucci, ['Diego']),
    ],
    vendaNaFeira: [720, 1180],
  },
  pro: {
    dono: 'demo-colheita',
    perfil: {
      nome: 'Antônio Kenji Nakamura',
      cpf: '159.043.782-61',
      telefone: '(11) 99128-4073',
      nascimento: '1972-01-30',
      email: 'kenji.sitio@exemplo.com.br',
      foto: '',
      matricula: '008.457-1',
      validade: '31/12/2027',
      cnpj: '28.615.940/0001-37',
      ccm: '5.903.127-4',
      titular: 'Antônio Kenji Nakamura',
      barraca: 'Sítio Nakamura',
      grupo: 'Hortifrutícola',
    },
    feiras: [
      montarFeira(FEIRAS.jurubim, ['Mariana', 'Josué']),
      montarFeira(FEIRAS.anastacio, ['Mariana', 'Josué', 'Seu Ivo']),
      montarFeira(FEIRAS.laranjeiras, ['Josué']),
    ],
    vendaNaFeira: [1150, 1900],
  },
};

// Xepas de cada feirante. "vendidas" = quantidade já vendida (esgotada quando quantidade = 0).
const XEPAS = {
  gratis: [
    { nome: 'Xepa de legumes do Tião', categoria: 'Verduras e legumes', itens: 'Abobrinha, chuchu, cenoura, beterraba e vagem', preco: 12, quantidade: 6, imagem: FOTOS.legumesFeira, descricao: 'Cerca de 3 kg. Legumes do fim da feira, ótimos para refogado e sopa.', feira: 0 },
    { nome: 'Kit tomate e cebola', categoria: 'Verduras e legumes', itens: 'Tomate italiano, cebola e pimentão', preco: 9, quantidade: 4, imagem: FOTOS.tomateCebola, descricao: 'Uns 2 kg de tomate bem maduro, perfeito para molho.', feira: 0 },
    { nome: 'Xepa de frutas da estação', categoria: 'Frutas', itens: 'Banana prata, mamão e laranja pera', preco: 14, quantidade: 3, imagem: FOTOS.bananas, descricao: 'Frutas maduras para comer na semana ou fazer suco.', feira: 0 },
    { nome: 'Cheiro-verde e temperos', categoria: 'Tempero', itens: 'Salsinha, cebolinha, coentro e hortelã', preco: 5, quantidade: 0, imagem: FOTOS.coentro, descricao: 'Maços do dia. Esgotou rápido!', feira: 0 },
  ],
  crescer: [
    { nome: 'Cesta Verde da Rô', categoria: 'Completa', itens: 'Alface, couve, rúcula, tomate, cenoura, banana e cheiro-verde', preco: 22, quantidade: 8, imagem: FOTOS.legumesSortidos, descricao: 'A cesta mais pedida: verduras, legumes e um pouco de fruta. Uns 4 kg.', feira: 0 },
    { nome: 'Folhas para salada', categoria: 'Verduras e legumes', itens: 'Alface crespa, alface roxa, rúcula e agrião', preco: 10, quantidade: 5, imagem: FOTOS.alface, descricao: 'Folhas colhidas na véspera, lavar e consumir em até 3 dias.', feira: 0 },
    { nome: 'Kit sopa', categoria: 'Verduras e legumes', itens: 'Mandioquinha, batata, cenoura, abóbora e salsão', preco: 13, quantidade: 6, imagem: FOTOS.abobora, descricao: 'Tudo para uma sopa de família. Cerca de 3 kg.', feira: 1 },
    { nome: 'Morangos do fim da feira', categoria: 'Frutas', itens: '3 bandejas de morango', preco: 15, quantidade: 4, imagem: FOTOS.morangos, descricao: 'Bem docinhos e maduros: bons para geleia e vitamina.', feira: 1 },
    { nome: 'Temperos da horta', categoria: 'Tempero', itens: 'Manjericão, alecrim, salsinha e cebolinha', preco: 6, quantidade: 0, imagem: FOTOS.manjericao, descricao: 'Esgotado nesta semana.', feira: 1 },
  ],
  pro: [
    { nome: 'Cesta Sítio Nakamura', categoria: 'Completa', itens: 'Alface, brócolis, couve-flor, cenoura, tomate, pepino, banana e mexerica', preco: 28, quantidade: 10, imagem: FOTOS.brocolisCouveFlor, descricao: 'Cesta grande, colhida no sítio em Mairiporã. Uns 5 kg.', feira: 0 },
    { nome: 'Xepa de frutas para vitamina', categoria: 'Frutas', itens: 'Banana, mamão, manga e morango', preco: 16, quantidade: 7, imagem: FOTOS.frutasTropicais, descricao: 'Frutas bem maduras, perfeitas para vitamina e doces.', feira: 1 },
    { nome: 'Legumes para refogar', categoria: 'Verduras e legumes', itens: 'Brócolis, vagem, abobrinha e berinjela', preco: 14, quantidade: 6, imagem: FOTOS.cestaLegumes, descricao: 'Mais ou menos 3 kg de legumes do dia.', feira: 1 },
    { nome: 'Tomates para molho', categoria: 'Verduras e legumes', itens: 'Tomate débora e italiano, 3 kg', preco: 11, quantidade: 5, imagem: FOTOS.tomates, descricao: 'Tomates maduros que não aguentam até a próxima feira.', feira: 0 },
    { nome: 'Salada pronta da semana', categoria: 'Verduras e legumes', itens: 'Alface americana, rúcula, tomate-cereja e pepino', preco: 12, quantidade: 4, imagem: FOTOS.alfaceCrespa, descricao: 'Folhas e legumes para saladas de 4 dias.', feira: 2 },
    { nome: 'Kit temperos orientais', categoria: 'Tempero', itens: 'Cebolinha, gengibre, alho e shissô', preco: 7, quantidade: 0, imagem: FOTOS.gengibre, descricao: 'Esgotado: volta no próximo sábado.', feira: 2 },
  ],
};

const DEMO_CONSUMIDOR = {
  nome: 'Juliana Ramos',
  cpf: '426.913.058-27',
  telefone: '(11) 96541-2738',
  nascimento: '1994-07-08',
  email: 'juliana.ramos@exemplo.com.br',
  foto: '',
};

const OUTROS_CLIENTES = [
  'Márcia Lopes', 'Pedro Henrique Silva', 'Dona Cida', 'Rafael Oliveira', 'Fernanda Nunes',
  'Carlos Eduardo', 'Bianca Moreira', 'Luiz Fernando', 'Tatiane Rocha', 'Gustavo Almeida',
  'Aparecida Santos', 'Renata Campos', 'Thiago Barbosa', 'Sônia Prado',
];

// ---------- Montagem ----------

function idXepa(plano, indice) {
  return { gratis: 1731000000100, crescer: 1731000000200, pro: 1731000000300 }[plano] + indice;
}

// "dono" do feirante ativo vira 'demo' (o app trata 'demo' como o feirante da demonstração).
function donoDe(plano, planoAtivo) {
  return plano === planoAtivo ? 'demo' : FEIRANTES[plano].dono;
}

function montarXepas(planoAtivo) {
  const lista = [];
  Object.entries(XEPAS).forEach(([plano, xepas]) => {
    const feirante = FEIRANTES[plano];
    xepas.forEach((xepa, indice) => {
      const feira = feirante.feiras[xepa.feira];
      lista.push({
        id: idXepa(plano, indice),
        idFeirante: donoDe(plano, planoAtivo),
        nome: xepa.nome,
        categoria: xepa.categoria,
        itens: xepa.itens,
        preco: xepa.preco,
        quantidade: xepa.quantidade,
        validade: xepa.quantidade > 0 ? diasAFrente(3 + (indice % 3)) : diasAtras(2).toISOString().slice(0, 10),
        local: feira.endereco,
        descricao: xepa.descricao,
        imagem: xepa.imagem,
        feira: feira.nome,
        idFeira: feira.id,
        dias: feira.dias,
        horario: feira.horario,
        cep: feira.cep,
        feirante: feirante.perfil.nome,
        barraca: feirante.perfil.barraca,
        cadastradoEm: diasAtras(1 + indice, 14).toISOString(),
      });
    });
  });
  return lista;
}

function montarFeiras(planoAtivo) {
  return Object.entries(FEIRANTES).flatMap(([plano, feirante]) => (
    feirante.feiras.map((feira) => ({ ...feira, idFeirante: donoDe(plano, planoAtivo) }))
  ));
}

// Pedidos da Juliana (consumidora da demonstração): números 0001 a 0006.
const PEDIDOS_CONSUMIDOR = [
  { plano: 'crescer', itens: [[0, 1], [3, 1]], dias: 26, hora: 10, nota: 5, comentario: 'Cesta caprichada, tudo fresquinho!' },
  { plano: 'pro', itens: [[0, 1]], dias: 19, hora: 11, nota: 5, comentario: 'Rendeu a semana inteira.' },
  { plano: 'gratis', itens: [[0, 1], [1, 1]], dias: 14, hora: 9, nota: 4, comentario: 'Ótimo preço, legumes bem maduros.' },
  { plano: 'pro', itens: [[1, 2]], dias: 8, hora: 10, entrega: true, nota: 5, comentario: 'Chegou rapidinho em casa.' },
  { plano: 'crescer', itens: [[2, 1], [1, 1]], dias: 4, hora: 9 },
  { plano: 'gratis', itens: [[2, 1]], dias: 0, hora: 8, pendente: true },
];

const ENDERECO_CONSUMIDOR = {
  cep: '02925-000',
  logradouro: 'Avenida Itaberaba',
  numero: '1520',
  complemento: 'Apto 34',
  bairro: 'Freguesia do Ó',
  cidade: 'São Paulo',
  uf: 'SP',
};

function itemDoPedido(plano, indiceXepa, quantidade, planoAtivo) {
  const xepa = XEPAS[plano][indiceXepa];
  const feirante = FEIRANTES[plano];
  const feira = feirante.feiras[xepa.feira];
  return {
    id: idXepa(plano, indiceXepa),
    idFeirante: donoDe(plano, planoAtivo),
    nome: xepa.nome,
    categoria: xepa.categoria,
    descricao: xepa.itens,
    barraca: feirante.perfil.barraca,
    retirada: feira.endereco,
    quantidade,
    preco: xepa.preco,
    imagem: xepa.imagem,
  };
}

function montarPedido(numero, definicao, consumidor, planoAtivo) {
  const data = diasAtras(definicao.dias, definicao.hora, (numero * 7) % 60);
  const itens = definicao.itens.map(([indice, qtd]) => itemDoPedido(definicao.plano, indice, qtd, planoAtivo));
  const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
  const frete = definicao.entrega ? 6.9 : 0;
  return {
    numero: String(numero).padStart(4, '0'),
    data: data.toISOString(),
    consumidor,
    plano: definicao.plano,
    itens,
    total: centavos(subtotal + frete),
    status: definicao.pendente ? 'Pendente de retirada' : 'Retirado',
    codigo: String(1000 + ((numero * 7919) % 9000)),
    avaliacao: definicao.nota
      ? { nota: definicao.nota, comentario: definicao.comentario || '', data: diasAtras(Math.max(0, definicao.dias - 1), 18).toISOString() }
      : null,
    recebimento: definicao.entrega
      ? { tipo: 'entrega', endereco: ENDERECO_CONSUMIDOR, frete: { valor: frete, entregas: [{ feira: itens[0].barraca, distanciaKm: 3.4, valor: frete }] } }
      : { tipo: 'retirada' },
  };
}

// Vendas para outros clientes: mais vendas quanto maior o plano.
function definicoesOutrosClientes() {
  const sorteio = criarSorteio(42);
  const quantidade = { gratis: 7, crescer: 12, pro: 16 };
  const lista = [];

  Object.entries(quantidade).forEach(([plano, total]) => {
    const disponiveis = XEPAS[plano].map((_, indice) => indice);
    for (let i = 0; i < total; i += 1) {
      const indice = disponiveis[Math.floor(sorteio() * disponiveis.length)];
      const segundo = sorteio() > 0.6 ? disponiveis[(indice + 1) % disponiveis.length] : null;
      // As duas vendas mais recentes de cada feirante ainda esperam retirada.
      const dias = i < 2 ? i : Math.floor(sorteio() * 40) + 1;
      lista.push({
        plano,
        itens: segundo === null ? [[indice, sorteio() > 0.7 ? 2 : 1]] : [[indice, 1], [segundo, 1]],
        dias,
        hora: 8 + Math.floor(sorteio() * 6),
        pendente: i < 2,
        nota: i >= 2 && sorteio() > 0.4 ? (sorteio() > 0.3 ? 5 : 4) : null,
        cliente: OUTROS_CLIENTES[Math.floor(sorteio() * OUTROS_CLIENTES.length)],
      });
    }
  });
  return lista.sort((a, b) => b.dias - a.dias);
}

function montarPedidos(planoAtivo, { soDoConsumidor }) {
  const pedidos = PEDIDOS_CONSUMIDOR.map((definicao, indice) => (
    montarPedido(indice + 1, definicao, DEMO_CONSUMIDOR.nome, planoAtivo)
  ));
  if (soDoConsumidor) return pedidos;

  definicoesOutrosClientes().forEach((definicao) => {
    pedidos.push(montarPedido(pedidos.length + 1, definicao, definicao.cliente, planoAtivo));
  });
  return pedidos;
}

// ---------- Conversas ----------

const MENSAGENS_RETIRADO = [
  ['consumidor', 'Oi! Passo aí perto das 11h para retirar, pode ser?'],
  ['feirante', 'Pode sim! Já deixei separado com seu nome.'],
  ['consumidor', 'Retirei, muito obrigada!'],
];

const MENSAGENS_PENDENTE = [
  ['consumidor', 'Bom dia! Consigo retirar até que horas?'],
  ['feirante', 'Bom dia! Até as 12h30. É só mostrar o código na barraca.'],
  ['consumidor', 'Combinado, chego umas 11h.'],
];

function montarConversa(pedido) {
  const feirante = FEIRANTES[pedido.plano];
  const inicio = new Date(pedido.data);
  const pendente = pedido.status !== 'Retirado';
  const roteiro = pendente ? MENSAGENS_PENDENTE : MENSAGENS_RETIRADO;
  const mensagens = [
    { id: 1, autor: 'sistema', texto: `Novo pedido nº ${pedido.numero} realizado. Total: ${pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}.`, data: inicio.toISOString() },
    ...roteiro.map(([autor, texto], indice) => ({
      id: indice + 2,
      autor,
      texto,
      data: new Date(inicio.getTime() + (indice + 1) * 6 * 60000).toISOString(),
    })),
  ];
  const ultima = mensagens.at(-1).data;
  const locais = [...new Set(pedido.itens.map((item) => item.retirada))];

  return {
    id: `pedido-${pedido.numero}`,
    consumidor: pedido.consumidor,
    idFeirante: pedido.itens[0].idFeirante,
    feirante: feirante.perfil.barraca,
    status: pendente ? 'recente' : 'finalizada',
    criadaEm: inicio.toISOString(),
    finalizadaEm: pendente ? null : new Date(inicio.getTime() + 3 * 3600000).toISOString(),
    // Pedidos pendentes: o feirante ainda não leu a última mensagem do cliente.
    leituras: { consumidor: ultima, feirante: pendente ? mensagens[1].data : ultima },
    pedido: {
      numero: pedido.numero,
      data: pedido.data,
      total: pedido.total,
      retirada: pedido.itens[0].retirada,
      recebimento: pedido.recebimento.tipo === 'entrega'
        ? { titulo: 'Entrega em casa', detalhe: 'Avenida Itaberaba, 1520 - Apto 34 - Freguesia do Ó, São Paulo/SP - CEP 02925-000', taxa: pedido.recebimento.frete.valor, distancias: [3.4] }
        : { titulo: 'Retirada na feira', detalhe: locais.join(' • '), taxa: null, distancias: [] },
      itens: pedido.itens.map(({ nome, quantidade, preco }) => ({ nome, quantidade, preco })),
    },
    mensagens,
  };
}

// ---------- Financeiro do feirante ativo ----------

function montarFinanceiro(plano, pedidos) {
  const feirante = FEIRANTES[plano];
  const taxa = PLANOS.find((item) => item.id === plano).taxa;
  const percentual = Math.round(taxa * 100);
  const sorteio = criarSorteio({ gratis: 7, crescer: 11, pro: 13 }[plano]);
  const rendas = [];
  const gastos = [];
  let idRenda = 1;
  let idGasto = 1;

  // Vendas pelo Xepa+: valor líquido nos lucros e a comissão nas despesas.
  pedidos
    .filter((pedido) => pedido.itens.some((item) => item.idFeirante === 'demo'))
    .forEach((pedido) => {
      const valorTaxa = centavos(pedido.total * taxa);
      rendas.push({
        id: idRenda++,
        tipo: 'renda',
        descricao: `Pedido nº ${pedido.numero} - ${pedido.itens.map((item) => `${item.quantidade}x ${item.nome}`).join(', ')}`,
        valor: centavos(pedido.total - valorTaxa),
        valorBruto: pedido.total,
        taxa: valorTaxa,
        data: dataEmTexto(new Date(pedido.data)),
        categoria: 'Venda de xepa pelo Xepa+',
        feira: pedido.itens[0].retirada,
        pedido: pedido.numero,
      });
      gastos.push({
        id: idGasto++,
        descricao: `Taxa Xepa+ (${percentual}%) - Pedido nº ${pedido.numero}`,
        quantidade: 1,
        valorUnitario: valorTaxa,
        categoria: 'taxaXepa',
        feira: pedido.itens[0].retirada,
        data: new Date(pedido.data).toISOString(),
        pedido: pedido.numero,
      });
    });

  // Cada dia de feira: venda na barraca e as compras para abastecer.
  feirante.feiras.forEach((feira) => {
    diasDeFeira(feira.dias).forEach((atras) => {
      const [minimo, maximo] = feirante.vendaNaFeira;
      const dataFeira = diasAtras(atras, 13);
      rendas.push({
        id: idRenda++,
        tipo: 'renda',
        descricao: `Vendas na barraca - ${feira.nome}`,
        valor: centavos(minimo + sorteio() * (maximo - minimo)),
        data: dataEmTexto(dataFeira),
        categoria: 'Venda na feira',
        feira: feira.endereco,
      });
      gastos.push(
        {
          id: idGasto++,
          descricao: 'Compra de mercadoria na Ceagesp',
          quantidade: 1,
          valorUnitario: centavos(minimo * (0.35 + sorteio() * 0.15)),
          categoria: 'mercadoria',
          feira: feira.endereco,
          data: diasAtras(atras + 1, 5).toISOString(),
        },
        {
          id: idGasto++,
          descricao: 'Diesel da Kombi',
          quantidade: 1,
          valorUnitario: centavos(70 + sorteio() * 50),
          categoria: 'combustivel',
          feira: feira.endereco,
          data: diasAtras(atras, 5).toISOString(),
        },
      );
      if (feira.funcionarios.length > 1) {
        gastos.push({
          id: idGasto++,
          descricao: 'Diária do ajudante',
          quantidade: feira.funcionarios.length - 1,
          valorUnitario: 120,
          categoria: 'ajudantes',
          feira: feira.endereco,
          data: dataFeira.toISOString(),
        });
      }
    });
  });

  // Encomendas e venda para comércio nos planos maiores.
  if (plano !== 'gratis') {
    [3, 10, 17, 24, 33].forEach((atras, indice) => {
      rendas.push({
        id: idRenda++,
        tipo: 'renda',
        descricao: indice % 2 ? 'Verduras para o Restaurante Sabor da Freguesia' : 'Encomenda de cestas para a escola do bairro',
        valor: centavos(plano === 'pro' ? 320 + sorteio() * 260 : 180 + sorteio() * 140),
        data: dataEmTexto(diasAtras(atras)),
        categoria: indice % 2 ? 'Venda para comércio' : 'Encomenda',
        feira: '',
      });
    });
  }

  // Despesas mensais e de equipamento.
  gastos.push(
    { id: idGasto++, descricao: 'Sacolas e bandejas', quantidade: 2, valorUnitario: 38.5, categoria: 'embalagens', feira: '', data: diasAtras(6, 10).toISOString() },
    { id: idGasto++, descricao: 'Sacolas e bandejas', quantidade: 2, valorUnitario: 38.5, categoria: 'embalagens', feira: '', data: diasAtras(29, 10).toISOString() },
    { id: idGasto++, descricao: 'Taxa de permissão de uso (TPU)', quantidade: 1, valorUnitario: plano === 'gratis' ? 96.4 : 182.3, categoria: 'taxas', feira: '', data: diasAtras(12, 10).toISOString() },
    { id: idGasto++, descricao: 'Lona nova da barraca', quantidade: 1, valorUnitario: 145, categoria: 'barraca', feira: '', data: diasAtras(20, 10).toISOString() },
    { id: idGasto++, descricao: 'Almoço da equipe', quantidade: 3, valorUnitario: 22, categoria: 'alimentacao', feira: '', data: diasAtras(1, 13).toISOString() },
  );

  return { rendas, gastos };
}

function montarSaques(plano, rendas) {
  if (plano === 'gratis') return [];
  const recebido = rendas
    .filter((renda) => renda.categoria === 'Venda de xepa pelo Xepa+')
    .reduce((soma, renda) => soma + renda.valor, 0);
  const chave = plano === 'pro'
    ? { tipoChave: 'cnpj', chave: FEIRANTES.pro.perfil.cnpj }
    : { tipoChave: 'celular', chave: FEIRANTES.crescer.perfil.telefone };
  const partes = plano === 'pro' ? [[21, 0.4], [7, 0.3]] : [[15, 0.45]];

  return partes.map(([atras, parte], indice) => ({
    id: 1732000000000 + indice,
    valor: centavos(Math.floor(recebido * parte)),
    ...chave,
    data: diasAtras(atras, 18).toISOString(),
  }));
}

function montarXepinha(plano) {
  if (plano === 'gratis') return [];
  const conversas = [
    {
      id: 'demo-xepinha-1',
      titulo: 'Como precificar minha xepa?',
      criadaEm: diasAtras(5, 15).toISOString(),
      mensagens: [
        { id: 'x1', remetente: 'user', texto: 'Como precificar minha xepa?', data: diasAtras(5, 15).toISOString() },
        { id: 'x2', remetente: 'ia', texto: 'Uma boa regra é cobrar entre 40% e 60% do preço normal da barraca. Some o custo do que foi comprado na Ceagesp, veja o que sobraria no fim da feira e coloque um preço que cubra ao menos esse custo. Cestas fechadas (ex.: R$ 20 a R$ 30) vendem mais rápido do que itens soltos.', data: diasAtras(5, 15, 1).toISOString() },
      ],
    },
  ];
  if (plano === 'pro') {
    conversas.push({
      id: 'demo-xepinha-2',
      titulo: 'Meus gastos com combustível estão altos?',
      criadaEm: diasAtras(2, 19).toISOString(),
      mensagens: [
        { id: 'x3', remetente: 'user', texto: 'Meus gastos com combustível estão altos?', data: diasAtras(2, 19).toISOString() },
        { id: 'x4', remetente: 'ia', texto: 'Pelo seu financeiro, o combustível fica perto de 8% das vendas da barraca, o que é normal para quem trabalha em três feiras. Para economizar, vale montar uma rota que passe pela Ceagesp e pelas feiras de Pirituba no mesmo trajeto e dividir o frete com outro feirante nos dias de Ceagesp.', data: diasAtras(2, 19, 1).toISOString() },
      ],
    });
  }
  return conversas;
}

// ---------- Gravação ----------

const CHAVES_DEMO = [
  'produtosFeirante', 'feirasFeirante', 'pedidosXepa', 'conversasXepa', 'lancamentosFinanceiros',
  'gastosFeirante', 'saquesFeirante', 'conversasXepinha:demo', 'perfilFeirante', 'perfilUsuario',
  'carrinhoXepa', 'recebimentoXepa',
];

function gravar(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

// perfil: 'consumidor' ou o id do plano do feirante ('gratis', 'crescer', 'pro').
export function prepararDemo(perfil) {
  CHAVES_DEMO.forEach((chave) => localStorage.removeItem(chave));

  const planoAtivo = perfil === 'consumidor' ? null : perfil;
  const pedidos = montarPedidos(planoAtivo, { soDoConsumidor: !planoAtivo });

  gravar('feirasFeirante', montarFeiras(planoAtivo));
  gravar('produtosFeirante', montarXepas(planoAtivo));
  gravar('pedidosXepa', pedidos.map((pedido) => ({ ...pedido, plano: undefined })));
  gravar('conversasXepa', pedidos.map(montarConversa));
  gravar('perfilUsuario', DEMO_CONSUMIDOR);

  if (!planoAtivo) {
    // Duas xepas já no carrinho para mostrar a compra.
    gravar('carrinhoXepa', [
      { id: idXepa('pro', 0), quantidade: 1 },
      { id: idXepa('crescer', 1), quantidade: 1 },
    ]);
    gravar('recebimentoXepa', { tipo: 'retirada', endereco: ENDERECO_CONSUMIDOR });
    return;
  }

  const { rendas, gastos } = montarFinanceiro(planoAtivo, pedidos);
  gravar('perfilFeirante', FEIRANTES[planoAtivo].perfil);
  gravar('lancamentosFinanceiros', rendas);
  gravar('gastosFeirante', gastos);
  gravar('saquesFeirante', montarSaques(planoAtivo, rendas));
  gravar('conversasXepinha:demo', montarXepinha(planoAtivo));
}
