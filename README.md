# FORZA

**Seu objetivo. Seu ritmo. Sua evolução.**

Plataforma fitness em português para organizar treinos e refeições, registrar sessões e acompanhar peso, medidas e cargas. Frontend HTML/CSS/JavaScript, API PHP e persistência MySQL. Design escuro Performance Blue, com Sora e Inter.

## Funcionalidades

- Cadastro, login, logout, onboarding e edição de perfil.
- Objetivo, experiência, equipamentos, disponibilidade e preferência kg/lb.
- Criação, edição e exclusão de treinos, exercícios e dias da semana.
- Sessões com registro individual das séries, cargas, repetições e cronômetro de descanso.
- Histórico preservado mesmo após editar ou excluir o plano de treino.
- Diário alimentar por data, busca no catálogo, porções em gramas e cálculo de calorias/macronutrientes no backend.
- Dicas filtradas pelo objetivo, com fontes consultáveis.
- Peso e medidas por data, evolução de cargas, calendário e frequência semanal.
- Alteração de senha e exclusão de conta e dados com confirmação e senha atual.
- Navegação móvel, foco visível, labels, estados de erro/carregamento e gráficos SVG com tabela acessível.

Não há conta demo nem dados pessoais fictícios. Crie sua conta para começar. Apenas a landing page tem um preview explicitamente ilustrativo.

## Tecnologias

PHP 8.2+ (compatível com a arquitetura PHP 8), PDO MySQL, MySQL 8+, JavaScript ES Modules e Fetch API, HTML5 e CSS Grid/Flexbox. Sem frameworks ou instalação de pacotes para rodar. Gráficos SVG próprios, sem dependência de Chart.js. Ícones SVG próprios.

## Estrutura

```text
frontend/
  *.html                    # 10 páginas de entrada
  assets/css/               # variáveis, base, componentes e responsividade
  assets/css/pages/          # layout público e autenticado
  assets/js/                # API, navegação e módulos por funcionalidade
  assets/icons/             # favicon SVG próprio
backend/
  public/index.php          # entrada única da API
  bootstrap/app.php         # ambiente, autoload e sessão
  app/Config/               # PDO e TLS
  app/Controllers/          # endpoints por domínio
  app/Models/               # persistência, autorização de propriedade e transações
  app/Services/             # validação e erros HTTP
  app/Middleware/           # autenticação e CSRF
  app/Routes/               # mapa da API
  .env.example
scripts/                    # instalação e diagnóstico do banco
database/                   # schema e seed
docs/                       # arquitetura, API, banco, fontes e testes
tests/                      # testes de API e navegador
router.php                  # roteador do servidor de desenvolvimento
```

## Requisitos

- PHP 8.2 ou superior, com `pdo_mysql`, `openssl`, `session` e `json`.
- MySQL 8+ local ou Aiven. O ambiente XAMPP desta entrega também foi validado com MariaDB 10.4.32; isso não substitui validar o servidor MySQL de produção.
- Navegador atual com JavaScript e módulos ES habilitados.
- Python 3 para o teste de API; Node 22+ e Chrome para o teste automatizado visual. Não são necessários para usar a plataforma.

No Windows/XAMPP, o executável costuma ser `C:\xampp\php\php.exe`. Adicione-o ao PATH ou substitua `php` nos comandos abaixo por esse caminho.

## Executar neste computador

O arquivo `backend/.env` contém a configuração ativa deste computador. A integração com Aiven/MySQL 8.4 foi validada com TLS. No Apache/XAMPP da porta 8080, acesse:

**http://localhost:8080/Forza/FORZA/frontend/login.html**

Como alternativa, o servidor de desenvolvimento pode ser acessado em:

**http://127.0.0.1:8000/frontend/index.html**

Se o servidor tiver sido encerrado, abra um terminal na raiz do projeto e execute:

```powershell
C:\xampp\php\php.exe -S 127.0.0.1:8000 router.php
```

Mantenha esse terminal aberto. Acesse a URL, crie uma conta e preencha seu perfil.

## Instalação em outro computador

1. Clone ou extraia o projeto.
2. Crie um banco vazio com codificação UTF-8:

```sql
CREATE DATABASE forza CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Copie o exemplo:

```powershell
Copy-Item backend/.env.example backend/.env
```

4. Configure host, porta, banco e usuário em `backend/.env`. O arquivo real é ignorado pelo Git e não faz parte do ZIP.
5. Para desenvolvimento **somente local**, use `APP_ENV=development` e `DB_REQUIRE_TLS=false`. Não use essa opção para Aiven.
6. Importe as tabelas e dados iniciais:

```powershell
php scripts/install.php
php scripts/check-db.php
```

O instalador recusa bancos com tabelas existentes. Não é uma ferramenta de migração e não deve ser executado sobre dados existentes. Caso uma importação seja interrompida, use um novo banco vazio e investigue o erro antes de tentar novamente.

Você também pode importar `database/schema.sql` seguido de `database/seed.sql` pelo cliente MySQL ou pelo phpMyAdmin. O schema não cria o banco e não contém comandos DROP.

7. Inicie o servidor:

```powershell
php -S 127.0.0.1:8000 router.php
```

8. Abra http://127.0.0.1:8000/frontend/index.html. Frontend e API devem compartilhar a mesma origem. Não abra os HTML por `file://` ou Live Server separado.

### Apache/XAMPP

Com Apache funcionando e este projeto em `htdocs/Forza/FORZA`, use `http://localhost/Forza/FORZA/`. O `index.php` da raiz redireciona à landing page. As regras `.htaccess` exigem Apache 2.4 e `AllowOverride` habilitado, bloqueando arquivos internos e permitindo apenas a entrada pública da API. Se a porta 80 estiver ocupada por outro serviço, prefira o servidor PHP em 8000 ou ajuste a porta do Apache.

O roteador PHP fornecido também bloqueia acesso HTTP a `.env`, SQL, testes, documentação e código interno.

## Aiven MySQL com TLS

1. Crie ou selecione seu serviço MySQL no Aiven Console.
2. Copie o hostname do serviço, porta, usuário e nome do banco da conexão fornecida pelo Aiven. Não substitua o hostname por um IP, pois o certificado precisa corresponder ao servidor.
3. Baixe o certificado CA do projeto/serviço e salve **fora da pasta pública**, por exemplo `C:/segredos/aiven/ca.pem`.
4. Configure:

```dotenv
DB_HOST=hostname-do-seu-servico
DB_PORT=porta-do-servico
DB_NAME=defaultdb
DB_USER=usuario-do-servico
DB_PASSWORD=sua-senha
DB_SSL_CA=C:/segredos/aiven/ca.pem
DB_REQUIRE_TLS=true
APP_ENV=production
APP_URL=https://seu-dominio
```

5. Permita o IP da aplicação nas regras de rede do serviço, se configuradas.
6. Execute `php scripts/check-db.php`. O diagnóstico deve mostrar um cipher TLS. Depois importe o schema e o seed no banco vazio.

O PDO recebe `MYSQL_ATTR_SSL_CA` e `MYSQL_ATTR_SSL_VERIFY_SERVER_CERT=true`. Em produção a aplicação exige TLS, mesmo se a variável de dispensa estiver incorreta, e verifica que a conexão negociou um cipher. Um CA ausente, certificado inválido ou falha de conexão impede a operação.

A produção deve usar HTTPS no site para os cookies Secure. Não use `APP_ENV=production` para testar login via HTTP local: o navegador não enviará esses cookies.

Referências: [conexão PHP no Aiven](https://aiven.io/docs/products/mysql/howto/connect-with-php) e [certificados TLS do Aiven](https://aiven.io/docs/platform/concepts/tls-ssl-certificates).

**Conexão Aiven validada neste ambiente:** MySQL 8.4.11 com certificado CA e TLS ativo. Credenciais e certificado permanecem fora do Git e do ZIP.

## API

Entrada: `backend/public/index.php?route=/caminho`. Respostas JSON no formato `{"data": ...}` ou `{"error": "mensagem"}`.

- `GET /auth/me`: usuário e token CSRF; também inicia uma sessão anônima.
- `POST /auth/cadastro`, `POST /auth/login`, `POST /auth/logout`.
- `PUT /perfil`, `PUT /auth/senha`, `DELETE /auth/conta`.
- `GET /dashboard`, `GET /exercicios`, CRUD `/treinos`.
- `GET/POST /sessoes`, `PUT /sessoes/{id}/series/{serie}`, `POST /sessoes/{id}/finalizar`.
- `GET /alimentos?q=`, CRUD `/refeicoes`, `GET /refeicoes?data=AAAA-MM-DD`.
- `GET /dicas`, `GET /progresso`, `POST/DELETE /pesos`, `POST/DELETE /medidas`.

Veja os campos e exemplos em [docs/API.md](docs/API.md).

## Como testar

Com o servidor e banco configurados:

```powershell
php tests/config_test.php
python tests/api_smoke.py http://127.0.0.1:8000
node tests/browser_smoke.mjs http://127.0.0.1:8000
```

Os testes criam contas temporárias com emails `@example.test`, efetuam operações reais e excluem essas contas ao terminar. Execute em desenvolvimento. O teste de navegador usa Chrome em modo headless, sem janela, e salva capturas em `artifacts/` (ignorado no Git). Para outro caminho de instalação, defina `CHROME_PATH`.

As tentativas de autenticação contam para o limitador de 10 tentativas por IP ou email em 15 minutos. Repetir várias vezes os testes nesse intervalo pode bloquear novas autenticações até a janela expirar.

Confira evidências e roteiro manual em [docs/TESTING.md](docs/TESTING.md).

## Segurança

Consultas preparadas reais, senhas com `password_hash/password_verify`, regeneração do ID da sessão após autenticação e troca de senha, cookies HttpOnly/SameSite e Secure em produção. Todas as mutações exigem CSRF, inclusive login. Os controllers restringem cada registro ao usuário autenticado. Validação de números, datas reais, limites e catálogos no backend. Valores inseridos no HTML são escapados. Erros internos não são enviados ao navegador. Autenticação tem limitação persistida no banco por IP/email. Séries de sessões finalizadas são imutáveis. Operações compostas usam transações.

Para produção, configure um usuário MySQL com privilégios mínimos, HTTPS, backups e monitoramento de logs. O servidor embutido do PHP é para desenvolvimento.

## Fontes, ícones e licenças

O catálogo inicial contém nove itens verificados da **TACO, NEPA/Unicamp, 4ª edição (2011)**. IDs originais e fonte são armazenados no banco. Valores por 100 g, multiplicados pela quantidade consumida. Não há prescrição de calorias ou macros.

Dicas educativas são paráfrases com links da OMS, CDC e ACSM; não constituem avaliação individual. Veja [docs/SOURCES.md](docs/SOURCES.md).

Não foram baixados ícones do Flaticon. Todos os pictogramas são SVG próprios definidos em `utils.js`, e o favicon é original. Para substituir por ícones de https://www.flaticon.com/br/, obtenha a licença adequada e mantenha atribuições exigidas pelo autor/plano. Não há URLs de ícones fictícias.

Sora e Inter são carregadas do Google Fonts e distribuídas por seus autores sob SIL Open Font License. Se a rede bloquear o serviço, o navegador usa sans-serif local. Para uma instalação sem rede externa, hospede as fontes localmente com as respectivas licenças.

Código original sob [MIT](LICENSE). Fontes e dados de terceiros mantêm suas condições próprias.

## Expansões possíveis

- Ampliar o catálogo com itens verificados e versões documentadas.
- Adicionar recuperação de senha por email e verificação de endereço.
- Paginação do histórico para grandes volumes e migrações de schema versionadas.
- Exportação de dados, acompanhamento profissional e auditoria adicional de acessibilidade.

## Navegação e configuração no Apache

Todas as telas autenticadas ficam disponíveis no menu, inclusive quando o perfil ainda não foi concluído. Nesse caso, um aviso leva ao preenchimento do perfil, necessário para personalizar as dicas e o objetivo. O cadastro de treino exige nome, ao menos um dia da semana e um exercício, com erros exibidos no próprio formulário.

A configuração é carregada uma vez por requisição pela classe `Env`, sem alterar o ambiente global do processo Apache. As entradas de `backend/.env` têm prioridade; variáveis do sistema servem como alternativa para chaves ausentes. Isso impede que chamadas simultâneas percam a configuração do certificado. `DB_SSL_CA` aceita caminho absoluto ou relativo à pasta `backend` (por exemplo, `ca.pem`).

## Redesign da dashboard

A visão geral usa uma nova composição com métricas agrupadas, treino em destaque, agenda da semana, diário alimentar, gráfico responsivo e recomendações por categoria. As funções e os dados da API foram preservados. Veja decisões e capturas de alta fidelidade em [docs/DESIGN.md](docs/DESIGN.md).

```powershell
node tests/browser_smoke.mjs http://localhost:8080/Forza/FORZA --design-review
```

Esse teste cria uma conta temporária, exercita o filtro do gráfico e gera capturas em `artifacts/`. Não altera os registros de contas existentes.
