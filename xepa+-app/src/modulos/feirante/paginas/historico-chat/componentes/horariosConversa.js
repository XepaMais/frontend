// Funções do chat usadas em várias telas (lista de conversas, chat, chat com a IA).
// Ficam fora dos componentes para o "fast refresh" do Vite funcionar.
import Styles from '@/modulos/feirante/paginas/historico-chat/estilos/ChatHist.module.css';

const CORES_AVATAR = ['avatarVerde', 'avatarLaranja', 'avatarAmarelo'];

// A cor depende só do nome: a mesma pessoa tem a mesma bolinha em qualquer tela.
export function corDoAvatar(nome = '') {
  let soma = 0;

  for (const letra of nome) {
    soma += letra.charCodeAt(0);
  }

  return Styles[CORES_AVATAR[soma % CORES_AVATAR.length]];
}

function mesmoDia(a, b) {
  return a.toDateString() === b.toDateString();
}

// Hoje: 16:50 · Ontem · 07/10
export function horarioCurto(data) {
  if (!data) return '';

  const momento = new Date(data);
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);

  if (mesmoDia(momento, hoje)) {
    return momento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  if (mesmoDia(momento, ontem)) return 'Ontem';

  return momento.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

export function horarioMensagem(data) {
  const momento = new Date(data);
  const hora = momento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return mesmoDia(momento, new Date()) ? hora : `${horarioCurto(data)} ${hora}`;
}
