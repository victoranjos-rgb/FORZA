# API FORZA

Base relativa: `../backend/public/index.php?route=` + caminho codificado. A query adicional usa `&data=...` ou `&q=...`.

## Convenções

Cookies de sessão na mesma origem. Todas as operações diferentes de GET exigem `X-CSRF-Token`. Obtenha o token com GET `/auth/me`; atualize o token retornado após login/cadastro. Envie JSON (`Content-Type: application/json`). Datas no formato `AAAA-MM-DD`, sem datas futuras. Cargas persistidas e transmitidas em **kg**, medidas em **cm** e alimentos em **g**. Conversão de kg/lb é apenas de exibição.

Sucesso: `{"data": ...}`. Erro: `{"error":"mensagem"}`. Códigos: 400 JSON/rota inválida; 401 não autenticado; 403 CSRF; 404 inexistente ou pertencente a outra pessoa; 409 conflito; 413 corpo acima de 128 KiB; 422 validação; 429 limite de autenticação; 500 erro interno genérico. Sucessos usam 200, inclusive criação e exclusão.

| Método | Caminho | Entrada / resultado |
|---|---|---|
| GET | `/auth/me` | `{user: null ou {id,nome,email,perfil}, csrf}` |
| POST | `/auth/cadastro` | `{nome,email,senha}` → usuário e CSRF |
| POST | `/auth/login` | `{email,senha}` → usuário e CSRF |
| POST | `/auth/logout` | `{}` → `{ok:true}` |
| PUT | `/auth/senha` | `{senha_atual,nova_senha}` |
| DELETE | `/auth/conta` | `{senha,confirmacao:"EXCLUIR"}` |
| PUT | `/perfil` | Perfil completo conforme exemplo abaixo |
| GET | `/dashboard` | Estatísticas, treinos, refeições do dia, progresso e dicas |
| GET | `/exercicios` | Catálogo de exercícios |
| GET | `/treinos` | Planos com exercícios, carga e descanso |
| POST | `/treinos` | Treino completo → `{id}` |
| PUT | `/treinos/{id}` | Substitui nome, dias e exercícios do plano |
| DELETE | `/treinos/{id}` | Exclui plano, preserva sessões históricas |
| GET | `/sessoes` | Sessões com séries persistidas |
| POST | `/sessoes` | `{treino_id}` → `{id}`; uma sessão aberta por pessoa |
| PUT | `/sessoes/{id}/series/{serie_id}` | `{repeticoes,carga,concluida:0 ou 1}` |
| POST | `/sessoes/{id}/finalizar` | `{}`; exige pelo menos uma série concluída |
| GET | `/alimentos` | Catálogo; filtro opcional `q` |
| GET | `/refeicoes` | Data opcional `data`; padrão hoje em São Paulo |
| POST | `/refeicoes` | Refeição completa → `{id}` |
| PUT | `/refeicoes/{id}` | Substitui nome, data e alimentos |
| DELETE | `/refeicoes/{id}` | Exclui refeição e seus itens |
| GET | `/dicas` | Conteúdo filtrado pelo objetivo do perfil |
| GET | `/progresso` | `{pesos,medidas,sessoes,cargas}` |
| POST | `/pesos` | `{data,peso}`; atualiza se a data já existir |
| DELETE | `/pesos/{id}` | Exclui registro próprio |
| POST | `/medidas` | `{data,cintura,quadril,braco}`; atualiza na mesma data |
| DELETE | `/medidas/{id}` | Exclui registro próprio |

## Perfil

```json
{"nome":"Seu nome","idade":24,"altura":175,"peso":70,"objetivo_id":2,"nivel":"iniciante","dias_semana":3,"minutos_treino":45,"equipamentos":"Halteres e peso corporal","unidade_carga":"kg"}
```

Objetivos: 1 emagrecer, 2 ganhar massa, 3 manter/condicionamento. Níveis: `iniciante`, `intermediario`, `avancado`. Unidades: `kg`, `lb`. Idade 13–100, altura 100–250 cm, peso 25–400 kg, 1–7 dias e 10–240 minutos por treino. Nome e email pertencem ao cadastro; o perfil permite editar o nome. Não há alteração de email nesta versão.

## Plano de treino

```json
{"nome":"Treino A","dias":[1,3,5],"exercicios":[{"exercicio_id":1,"series":3,"repeticoes":10,"carga":0,"descanso":60}]}
```

Dias: 0 domingo até 6 sábado. De 1 a 30 exercícios, séries 1–20, repetições 1–100, carga 0–1000 kg e descanso 0–600 segundos. Ao iniciar, a sessão copia nome e parâmetros do plano. Editar o plano não altera séries históricas. Uma sessão finalizada não permite novas alterações.

## Refeição

```json
{"nome":"Almoço","data":"2026-11-03","alimentos":[{"alimento_id":3,"gramas":150},{"alimento_id":561,"gramas":100}]}
```

Até 40 itens por refeição, 1–5000 g por item. Nutrientes retornados são calculados no servidor: `valor_por_100g × gramas / 100`. Não envie totais nutricionais do cliente. A data acima é apenas exemplo de formato.

## Fetch

```js
const endpoint = '../backend/public/index.php?route=';
const me = await fetch(endpoint + encodeURIComponent('/auth/me'), {
  credentials: 'same-origin'
}).then(r => r.json());
const response = await fetch(endpoint + encodeURIComponent('/pesos'), {
  method: 'POST', credentials: 'same-origin',
  headers: {'Content-Type':'application/json', 'X-CSRF-Token':me.data.csrf},
  body: JSON.stringify({data: new Date().toLocaleDateString('en-CA'), peso:70})
});
```

Esse exemplo exige usuário autenticado. O módulo `api.js` já centraliza essas operações, erros e atualização do token.
