# Delivery App API

API REST para gestão de delivery/lojas, autenticação de usuários e produtos, desenvolvida com Node.js, Express.js e MongoDB.

Este projeto expõe endpoints para:
- autenticação de lojistas e administradores
- cadastro e consulta de lojas
- atualização de senha
- criação e atualização de produtos
- renovação de tokens JWT via refresh token

## Stack utilizada
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- bcryptjs
- dotenv
- nodemon (desenvolvimento)

## Estrutura do projeto

```bash
.
├── src/
│   ├── controllers/
│   │   ├── AdminControllers.js
│   │   ├── AuthControllers.js
│   │   ├── ProductControllers.js
│   │   └── StoreControllers.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Products.js
│   │   ├── RefreshToken.js
│   │   └── Stores.js
│   └── routes/
│       └── authRoutes.js
├── .env
├── .gitignore
├── LICENSE
├── package.json
├── server.js
└── README.md
```

## Requisitos

- Node.js 18+ recomendado
- MongoDB local ou acessível por URI
- npm ou yarn

## Instalação

1. Clone o projeto:

```bash
git clone <url-do-repositorio>
cd "AppDelivery JAVASCRIPT"
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo:

```env
MONGO_URI=mongodb://127.0.0.1:27017/delivery
PORT=3000
JWT_SECRET=sua_chave_secreta
JWT_REFRESHSECRET=sua_chave_refresh
```

> Ajuste os valores conforme o ambiente local ou de produção.

## Executando a aplicação

Modo de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado com `nodemon` e ficará disponível na porta configurada em `.env`.

## Endpoints da API

A aplicação registra as rotas em `src/routes/authRoutes.js` e monta tudo no `server.js`.

### Autenticação

#### POST /login
Autentica um lojista.

Body exemplo:

```json
{
  "email": "loja@exemplo.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "store": {
    "id": "...",
    "email": "loja@exemplo.com",
    "role": "manager"
  }
}
```

#### POST /login-admin
Autentica um administrador.

#### POST /register-admin
Cria um novo administrador.

Body:

```json
{
  "email": "admin@exemplo.com",
  "password": "123456",
  "role": "admin"
}
```

#### POST /refresh-token
Renova o access token de uma loja.

#### POST /refresh-token-admin
Renova o access token de um administrador.

### Lojas

#### POST /register
Cria uma loja. Requer autenticação de administrador.

Body exemplo:

```json
{
  "email": "loja@exemplo.com",
  "cnpj": "12345678000199",
  "idCliente": "cliente-001",
  "fantasia": "Minha Loja",
  "address": "Rua A, 123",
  "password": "123456",
  "slug": "minha-loja",
  "role": "manager"
}
```

#### GET /store/:id
Retorna os dados de uma loja pelo id.

#### POST /store-update-password/:id
Atualiza a senha da loja. Requer autenticação.

Body:

```json
{
  "oldpassword": "senhaAntiga",
  "password": "novaSenha"
}
```

### Produtos

#### POST /create-product
Cria um produto para a loja autenticada.

Body exemplo:

```json
{
  "idProduto": "P001",
  "descricao": "Coca-Cola 600ml",
  "precoVenda": 8.5,
  "estoque": 25,
  "unidade": "UN",
  "fotoUrl": "https://exemplo.com/imagem.jpg"
}
```

#### PATCH /update-product/:id
Atualiza um produto da loja autenticada.

Exemplo:

```json
{
  "precoVenda": 9.5,
  "estoque": 20
}
```

## Autenticação e autorização

As rotas protegidas utilizam o middleware `authMiddleware` e `authMiddlewareAdmin` em `src/middlewares/authMiddleware.js`.

- `authMiddleware`: exige token JWT válido
- `authMiddlewareAdmin`: exige token JWT válido e role `admin`

O token deve ser enviado no header:

```http
Authorization: Bearer <token>
```

## Modelos principais

### Store
Campos principais:
- email
- cnpj
- idCliente
- fantasia
- address
- password
- slug
- role

### Product
Campos principais:
- storeId
- idProduto
- descricao
- precoVenda
- estoque
- unidade
- fotoUrl

### Admin
Campos principais:
- email
- password
- role

## Observações

- O projeto ainda não possui uma suíte de testes automatizados configurada (`package.json` contém apenas script `dev`).
- A aplicação conecta ao MongoDB na inicialização do servidor através de `server.js`.
- O arquivo `.env` deve ficar localizado na raiz do projeto e nunca deve ser versionado em ambientes compartilhados.

## Licença

Este projeto está sob a licença definida em [LICENSE](LICENSE).

## Dica de uso

Para começar rapidamente:

1. configure o `.env`
2. inicie o MongoDB
3. rode `npm run dev`
4. teste os endpoints com Postman, Insomnia ou Thunder Client

Se quiser, eu também posso criar uma versão mais profissional do README com badges, instruções de testes, exemplos de requisições em cURL e uma documentação de API em formato Swagger/OpenAPI.
