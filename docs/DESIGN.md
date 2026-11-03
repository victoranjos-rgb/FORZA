# FORZA — redesign da visão geral

## Direção

A composição passa a seguir a prioridade da rotina: resumo, treino do dia, alimentação, evolução e orientações. A sidebar e o header foram refinados para manter a mesma linguagem em todas as telas autenticadas.

A identidade original permanece: background #0B1020, superfícies #171F31, azul #397BFF, texto #F8FAFC, Sora e Inter. O azul marca ações e estados ativos; bordas e divisórias organizam o restante.

## O que mudou

- Métricas agrupadas em uma faixa com divisórias, com menos repetição de caixas e mais foco nos números.
- Boas-vindas com objetivo integrado e ação principal no header.
- Treino como área principal, com estado real, grupos musculares, preview dos exercícios e agenda semanal.
- Diário alimentar com distribuição de nutrientes, calorias, última refeição e ação para registrar.
- Gráfico de peso com preenchimento discreto, pontos, tabela acessível e filtros funcionais de 30 dias ou histórico completo.
- O gráfico redesenha seu sistema de coordenadas conforme a largura disponível, preservando a legibilidade no celular.
- Últimos registros provenientes das sessões, refeições do dia e registros de peso da própria conta.
- Recomendações organizadas por categoria: treino, alimentação e recuperação, quando disponíveis para o objetivo.
- Sidebar com seções, estado ativo discreto, foco atual e rodapé de conta; menu móvel com fundo de fechamento e suporte a Escape.

## Comportamento dos dados

Nenhum valor ilustrativo foi adicionado à dashboard do produto. As métricas, séries, refeições, agenda e histórico vêm da API existente. Os períodos do gráfico são filtrados no cliente sem alterar os registros.

A consistência conta dias distintos com sessões finalizadas na semana. A quantidade de sessões aparece separadamente. O objetivo semanal corresponde à disponibilidade informada no perfil. As barras e o círculo nutricional representam a distribuição dos gramas registrados, sem prescrever metas de alimentação.

Quando faltam dados, a tela conserva sua estrutura e indica como começar. Não são desenhadas curvas de peso fictícias.

## Prévia de alta fidelidade

As imagens são capturas da implementação real no navegador, usando **uma conta temporária de teste** com registros criados exclusivamente para a revisão visual. Os números ilustram essa conta, não a conta do usuário. A conta temporária é excluída ao final do teste.

- [Desktop](previews/dashboard-desktop.png)
- [Celular](previews/dashboard-mobile.png)

## Arquivos principais

- `frontend/assets/js/dashboard.js`: composição e interações da visão geral.
- `frontend/assets/js/navigation.js`: sidebar, header, conta e menu móvel.
- `frontend/assets/css/pages/dashboard.css`: estilos específicos da dashboard.
- `frontend/assets/css/pages/app-shell.css`: estrutura compartilhada das telas autenticadas.
- `tests/browser_smoke.mjs --design-review`: revisão de estados preenchidos, períodos do gráfico e larguras de 320 a 1920 px.

Os ícones são SVG próprios do sistema, com traços consistentes. A entrega é implementada em HTML/CSS/JavaScript, sem arquivo Figma ou imagem estática substituindo as funções do aplicativo.
