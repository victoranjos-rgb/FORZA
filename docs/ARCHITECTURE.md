# Arquitetura FORZA

- frontend/: páginas HTML acessíveis, estilos responsivos e módulos JavaScript com Fetch API.
- backend/public/: entrada HTTP da API REST.
- backend/app/Config/: configuração de ambiente e conexão PDO MySQL com TLS.
- backend/app/Controllers/: autenticação, perfil, treinos, alimentação e progresso.
- backend/app/Models/: persistência e consultas limitadas ao usuário autenticado.
- backend/app/Services/: validação e regras de negócio.
- backend/app/Middleware/: sessão, CSRF e autorização.
- backend/app/Routes/: mapeamento dos endpoints.
- database/: schema relacional e dados iniciais com fontes documentadas.
- docs/: contratos da API, banco e instruções de validação.

A aplicação será servida na mesma origem para frontend e API. Dados pessoais serão persistidos no MySQL. Credenciais ficarão fora do código versionado. A configuração de produção exigirá TLS e certificado CA para conexão ao Aiven.
