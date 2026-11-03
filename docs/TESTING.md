# Validação da entrega

Executado em 3 de novembro de 2026, no Windows/XAMPP, PHP 8.2.12 e MariaDB 10.4.32, com Chrome headless e Node 24.20.

## Testes executados

- Sintaxe dos 18 arquivos PHP: aprovada.
- `python tests/api_smoke.py`: **59 requisições verificadas**, incluindo cadastro, CSRF, login/logout, alteração de senha, perfil, mudança do filtro de dicas, validação de datas e limites, treino, sessão, série, alimentação, cálculos, peso, medidas e exclusão.
- Isolamento entre duas contas: outra pessoa não consegue editar/excluir planos, finalizar sessões, editar séries ou excluir registros alheios. Resposta 404 nesses casos.
- Snapshot histórico: alteração do plano não modifica séries realizadas; exclusão do plano mantém a sessão com referência nula.
- Refeição: 200 g de arroz cozido retornam 256 kcal; editar para 100 g retorna 128 kcal.
- Senha nova com espaços nas extremidades: preservada e aceita no login subsequente.
- `node tests/browser_smoke.mjs`: aprovado, sem exceções JavaScript nos fluxos exercitados.
- Navegador: cadastro, onboarding, dashboard, menu móvel, criar treino, iniciar sessão, concluir série, finalizar treino, registrar refeição e peso, consultar dicas e progresso.
- Dashboard sem overflow horizontal em 320, 390, 768, 1024 e 1440 px. Landing em desktop/mobile e editores de treino/refeição em mobile também verificados.
- Capturas reais geradas em `artifacts/`, ignoradas no Git e fora do ZIP. Landing e dashboard revisados visualmente.
- Banco ao final: zero contas de teste remanescentes; nove alimentos no catálogo.

## Roteiro manual complementar

1. Crie uma conta, preencha o perfil e altere seu objetivo. Confirme o conteúdo das dicas.
2. Monte dois treinos com dias diferentes. Edite e remova exercícios.
3. Inicie uma sessão, ajuste carga/repetições e marque uma série. Observe o descanso e reabra a página: os dados devem persistir.
4. Finalize com pelo menos uma série concluída e consulte o histórico.
5. Registre uma refeição, pesquise um alimento, edite as gramas e consulte outra data.
6. Registre peso/medidas, substitua um registro na mesma data e consulte as tabelas dos gráficos.
7. Altere sua preferência kg/lb e confira a exibição de cargas.
8. Use Tab, Shift+Tab e Escape. O menu móvel fechado fica fora da navegação por teclado.
9. Altere a senha, saia e entre novamente. Confirme a exclusão usando senha e EXCLUIR.

## Limites da validação

Atualização: credenciais e CA foram configurados no ambiente local. Conexão Aiven/MySQL 8.4.11 validada com TLS_AES_256_GCM_SHA384. Os 59 testes de API passaram também pelo Apache em http://localhost:8080/Forza/FORZA. Nenhum segredo é incluído neste documento.

A primeira validação usou o servidor embutido com `router.php`. A revisão seguinte também usa Apache/XAMPP na porta 8080, com as regras .htaccess ativas. A configuração de outro servidor ainda depende de AllowOverride.

A validação responsiva cobre as larguras descritas, não todos os aparelhos físicos. Não foi realizada auditoria externa formal de acessibilidade, teste de carga ou teste de penetração.

O limitador básico de autenticação está implementado; o teste integrado não esgota a janela deliberadamente. Repetir a suíte muitas vezes em 15 minutos pode alcançar o limite de tentativas.

## Regressão: chamadas simultâneas no Apache

O teste real no Chrome reproduziu respostas 500 em `/treinos` e `/exercicios` quando o frontend carregava dados em paralelo. O log indicava certificado CA ausente, apesar de a configuração funcionar no terminal e nas requisições sequenciais. O carregamento anterior usava `putenv`, alterando o ambiente global do processo Apache.

A correção introduz `App\Config\Env`, que armazena os valores por requisição, sem `putenv`. O teste `php tests/config_test.php` verifica que carregar o arquivo não modifica o ambiente do processo, incluindo casos de BOM, aspas, valor vazio e fallback. O teste de navegador passa a clicar nos links reais do menu, tanto em desktop como em celular, e testa a mensagem de validação quando nenhum dia de treino é selecionado.

### Executar as regressões

```powershell
php tests/config_test.php
node tests/browser_smoke.mjs http://localhost:8080/Forza/FORZA
node tests/browser_smoke.mjs http://localhost:8080/Forza/FORZA --without-profile
```

A opção `--without-profile` verifica as seis telas para uma conta ainda sem perfil, valida o erro de dia não selecionado, salva um treino, recarrega para conferir a persistência e faz seis chamadas simultâneas à API. Todas as operações usam somente uma conta temporária criada e removida pelo teste.

### Resultado da revisão no Apache/Aiven

- Configuração isolada: aprovada.
- 59 requisições da API no MySQL 8.4/Aiven: aprovadas.
- Navegador com cliques reais no menu, cadastro e execução de treino, alimentação, progresso, dicas e perfil: aprovado, zero exceções JavaScript.
- Conta sem perfil completo: seis telas acessíveis, treino salvo e mantido após recarregar.
- Seis endpoints carregados simultaneamente: todos responderam com sucesso, sem perda da configuração TLS.
- Sintaxe PHP e dos 12 módulos JavaScript: aprovada.

## Redesign da visão geral

O teste `--design-review` usa uma conta temporária para verificar a composição preenchida, os quatro indicadores, três exercícios no preview, três recomendações e a seleção de períodos do gráfico (cinco registros nos últimos 30 dias e seis no histórico). A conta é removida ao terminar.

Larguras verificadas: 320, 390, 768, 1024, 1280, 1440 e 1920 pixels. O teste também confere que o sistema de coordenadas do gráfico acompanha a largura real do painel. O teste completo de navegação, treino, refeição e peso passou com a nova sidebar e o novo header, sem exceções JavaScript. Capturas definitivas ficam em `docs/previews/`; os dados exibidos nelas pertencem à conta de teste.
