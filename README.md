<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="xepa+-app/src/assets/imagens/marca/logo-texto-escura.png" />
  <source media="(prefers-color-scheme: light)" srcset="xepa+-app/src/assets/imagens/marca/logo-texto-colorida.png" />
  <img src="xepa+-app/src/assets/imagens/marca/logo-texto-colorida.png" alt="Xepa+" width="320" />
</picture>

<br /><br />

**Conectamos feirantes e consumidores para que o alimento da feira chegue à mesa, e não ao lixo.**

**[xepamais.com.br](https://xepamais.com.br)** · [API (Swagger)](https://xepamais.com.br/api/docs) · [Back-end](https://github.com/XepaMais/backend) · [Banco de dados](https://github.com/XepaMais/database) · [Documentação](https://github.com/XepaMais/documentacao)

</div>

## Sobre este repositório

Este repositório guarda o **front-end** do Xepa+: o site que consumidores e feirantes usam no navegador, **sem instalar nada**, no celular, tablet ou computador. Ele é feito em **React** com **Vite** e publicado na **Vercel**.

**Onde ficam os dados:**
- Todos os dados de quem tem conta ficam na **[API do Xepa+](https://github.com/XepaMais/backend)**, guardados em MySQL: perfil, carrinho, pedidos, xepas, feiras, financeiro, conversas e fotos. A pessoa encontra tudo ao entrar de qualquer aparelho.
- O navegador guarda só o login da aba (`sessionStorage`) e os dados do [modo demonstração](#modo-demonstração) (`localStorage`). A demonstração funciona sem criar conta.

### Tecnologias

**Front-end:**<br><br>
<img align="center" src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" title="React">
<img align="center" src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" title="Vite">
<img align="center" src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" title="React Router">
<img align="center" src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" title="JavaScript">
<img align="center" src="https://img.shields.io/badge/CSS_Modules-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS Modules" title="CSS Modules">
<img align="center" src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" title="Google Maps">
<img align="center" src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" title="Gemini">

<br>

| Biblioteca | Para que serve no Xepa+ |
| --- | --- |
| `react-router-dom` | Navegação entre as páginas |
| `@react-google-maps/api` e `@vis.gl/react-google-maps` | Mapa das feiras e escolha do local ao cadastrar uma feira |
| `@google/model-viewer` | Cesta 3D da página inicial (`public/modelos/cesta-xepa.glb`) |
| `jspdf` e `jspdf-autotable` | Exportação do histórico financeiro em PDF |
| `lucide-react` | Ícones |
| `@number-flow/react` | Números animados nos painéis |
| `scrollreveal` | Animações ao rolar a página |

**Ferramentas utilizadas:**<br><br>
<img align="center" src="https://img.shields.io/badge/Figma-EA4C89?style=for-the-badge&logo=figma&logoColor=white" alt="Figma" title="Figma">
<img align="center" src="https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white" alt="Git" title="Git">
<img align="center" src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" title="GitHub">
<img align="center" src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" title="Vercel">

---

## Funcionalidades

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>Para o consumidor</h3>
      <ul>
        <li>Vitrine de xepas disponíveis perto de você</li>
        <li>Mapa das feiras livres da cidade</li>
        <li>Detalhe do produto com o perfil e a localização do feirante</li>
        <li>Carrinho, escolha entre retirar na feira ou receber em casa, pagamento e histórico de pedidos</li>
        <li>Chat direto com o feirante</li>
        <li>Painel "Seu impacto": quanto alimento você salvou e quanto economizou</li>
        <li>Receitas para aproveitar cada alimento</li>
      </ul>
      <img src=".github/readme/espaco.png" width="600" height="1" alt="" />
    </td>
    <td width="50%" valign="top">
      <h3>Para o feirante</h3>
      <ul>
        <li>Cadastro de feiras (com mapa) e de produtos</li>
        <li>Controle financeiro de rendas e gastos, com gráficos e exportação em PDF</li>
        <li>Sacar lucros para uma chave Pix (simulação)</li>
        <li>Histórico de vendas, histórico de produtos e planilhas</li>
        <li>Xepinha (Xep.AI): assistente com inteligência artificial (Gemini, chamado pela API) para o dia a dia da barraca</li>
        <li>Planos Semente (grátis, 15% de comissão), Broto (R$ 29,90, 8%) e Colheita (R$ 59,90, 5%), que liberam recursos diferentes</li>
      </ul>
      <img src=".github/readme/espaco.png" width="600" height="1" alt="" />
    </td>
  </tr>
</table>

**Para todos:**

- Cadastro com aceite obrigatório dos Termos de uso e das Diretrizes de Privacidade, e consentimento opcional para novidades por e-mail
- Página "Meus dados" para editar o perfil e trocar a foto, e lista de dispositivos conectados
- **Privacidade e dados (LGPD):** ver quando os termos foram aceitos, ligar ou desligar as novidades, baixar todos os seus dados e excluir a conta
- Páginas institucionais: Sobre nós, Xep.AI, Seja um feirante parceiro, Contato e suporte, Termos de uso e Diretrizes de Privacidade
- Widget de acessibilidade UserWay em todas as páginas

---

## Telas do site

| Área | Rotas principais |
| --- | --- |
| **Público** | `/` (início), `/sobre-nos`, `/xep-ai`, `/seja-parceiro`, `/suporte`, `/termos-de-uso`, `/privacidade`, `/mapa-home`, `/cozinha-home` |
| **Login e cadastro** | `/entrar`, `/cadastro` (escolher o perfil), `/cadastro/consumidor`, `/cadastro/feirante` e `/cadastro/feirante/negocio`, `/demo` |
| **Consumidor** | `/consumidor` (início), `/xepa?xepa=ID` (detalhe da oferta), `/consumidor/conversas`, `/mapa`, `/cozinha`, `/carrinho`, `/pagamento`, `/historico-pedidos`, `/impacto`, `/chat-consumidor`, `/perfil`, `/dispositivos` |
| **Feirante** | `/feirante` (início), `/feirante/conversas`, `/adicionar-produto`, `/adicionar-feira`, `/financeiro`, `/adicionar-gasto`, `/sacar`, `/planilhas`, `/planos`, `/chat-ia` (Xepinha), `/historico-vendas`, `/historico-produtos`, `/perfil-feirante`, `/dispositivos-feirante` |

As rotas ficam em [`xepa+-app/src/aplicacao/rotas`](xepa+-app/src/aplicacao/rotas), com uma lista para cada área. Endereços antigos (`/Crumb`, `/homeF`, `/Verduras`...) redirecionam para os novos ([`rotas-antigas.jsx`](xepa+-app/src/aplicacao/rotas/rotas-antigas.jsx)); um endereço inexistente mostra a página 404. Cada página tem título próprio na aba do navegador ([`TituloDaPagina.jsx`](xepa+-app/src/compartilhado/componentes/TituloDaPagina.jsx)).

### Modo demonstração

Na tela de login há o botão **"Visite nosso Demo"** (ou acesse `/demo`). Ele abre uma janela para escolher um perfil e entrar direto no site, sem cadastro:

- **Consumidor**
- **Feirante - Plano Semente**
- **Feirante - Plano Broto**
- **Feirante - Plano Colheita**

Cada plano de feirante libera recursos diferentes, como a Xepinha e a gestão financeira completa.

---

## Integração com a API

- Todas as chamadas passam por [`compartilhado/servicos/api.js`](xepa+-app/src/compartilhado/servicos/api.js), que:
  - monta o endereço da API e envia o token de login (`Authorization: Bearer`);
  - mostra o `message` de erro que a API devolve.
- **Sem conexão:** a pessoa vê "Sem conexão com o servidor. Verifique sua internet e tente de novo.", e o site não quebra.
- **Sessão expirada (`401`):** o site sai da conta sozinho e leva para `/entrar`.
- **Endereço da API:**
  - em produção, o site chama `/api`, e a Vercel repassa por HTTPS para `https://api.xepamais.com.br` ([`vercel.json`](xepa+-app/vercel.json));
  - em desenvolvimento, quem repassa é o proxy do Vite ([`vite.config.js`](xepa+-app/vite.config.js)).

## Acessibilidade

- O widget **UserWay** está em todas as páginas e oferece contraste, tamanho de fonte, leitura em voz e outros ajustes.
- Para quem usa teclado:
  - o link **"Pular para o conteúdo"** é o primeiro item do Tab;
  - o foco fica visível;
  - os pop-ups fecham com Esc.
- Para leitores de tela:
  - **título próprio em cada página**;
  - `lang="pt-BR"`;
  - todas as imagens com `alt`;
  - rótulos em todos os campos e `role="alert"` nas mensagens de erro.
- Os vídeos respeitam a preferência por menos movimento.

## Publicação

O site é publicado na **Vercel** a cada merge na `main`. O arquivo [`vercel.json`](xepa+-app/vercel.json):
- repassa `/api` para a API por HTTPS;
- manda as outras rotas para o `index.html`, para o React Router funcionar ao abrir ou recarregar qualquer página.
