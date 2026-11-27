<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="xepa+-app/src/assets/imagens/marca/logo-texto-escura.png" />
  <source media="(prefers-color-scheme: light)" srcset="xepa+-app/src/assets/imagens/marca/logo-texto-colorida.png" />
  <img src="xepa+-app/src/assets/imagens/marca/logo-texto-colorida.png" alt="Xepa+" width="320" />
</picture>

<br /><br />

**Conectamos feirantes e consumidores para que o alimento da feira chegue à mesa, e não ao lixo.**

![Status](https://img.shields.io/badge/status-em_desenvolvimento-FF5200?style=for-the-badge)

</div>

## Sobre este repositório

Este repositório guarda o **front-end** do Xepa+: o site que consumidores e feirantes usam no navegador. Ele é feito em **React** com **Vite** e funciona sozinho, sem servidor: os dados (perfil, carrinho, pedidos, produtos, feiras, finanças e conversas) ficam salvos no próprio navegador, com `localStorage`. Por isso dá para navegar por todas as telas, inclusive pelo [modo demonstração](#modo-demonstração), sem criar uma conta de verdade.

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
| `leaflet` e `react-leaflet` | Mapas auxiliares |
| `@google/generative-ai` | Xepinha (Xep.AI), a assistente com IA do feirante, usando o Gemini |
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
        <li>Xepinha (Xep.AI): assistente com inteligência artificial para o dia a dia da barraca</li>
        <li>Planos de assinatura (Grátis, Crescer e Pro), que liberam recursos diferentes</li>
      </ul>
      <img src=".github/readme/espaco.png" width="600" height="1" alt="" />
    </td>
  </tr>
</table>

**Para todos:**

- Cadastro com aceite obrigatório dos Termos de uso e das Diretrizes de Privacidade
- Página "Meus dados" para editar o perfil e trocar a foto, e lista de dispositivos conectados
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
- **Feirante - Plano Grátis**
- **Feirante - Plano Crescer**
- **Feirante - Plano Pro**

Cada plano de feirante libera recursos diferentes, como a Xepinha e a gestão financeira completa.

### Publicação

O site é publicado no **Vercel**. O arquivo [`vercel.json`](xepa+-app/vercel.json) manda todas as rotas para o `index.html`, para que o React Router funcione ao abrir ou recarregar qualquer página.
