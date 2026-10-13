# Delivery App API

API REST desenvolvida para gestão de delivery, lojas, produtos, pedidos e autenticação de lojistas/administradores. O backend foi construído em Node.js com Express e MongoDB, incluindo autenticação JWT, refresh token, upload de imagens para S3 e fluxo de pedidos público por loja.

## Visão geral

Este projeto permite que:

- lojistas realizem login e renovem tokens JWT
- administradores gerenciem lojas e acessos
- gestores cadastrem e consultem produtos da sua loja
- clientes criem pedidos vinculados a uma loja específica
- imagens de produtos sejam enviadas com presigned URL no Amazon S3

## Stack tecnológica

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- bcryptjs
- dotenv
- AWS SDK v3 para S3
- mongoose-paginate-v2
- nodemon (desenvolvimento)

## Estrutura do projeto

```bash
.
├── src/
│   ├── config/
│   │   └── s3.js
│   ├── controllers/
│   │   ├── AdminControllers.js
│   │   ├── AuthControllers.js
│   │   ├── OrdersControllers.js
│   │   ├── ProductControllers.js
│   │   ├── StoreControllers.js
│   │   └── UpdatePictureControllers.js
│   ├── middlewares/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Admin.js
│   │   ├── Orders.js
│   │   ├── Products.js
│   │   ├── RefreshToken.js
│   │   └── Stores.js
│   └── routes/
│       ├── AdminRoutes.js
│       ├── AuthRoutes.js
│       ├── OrdersRoutes.js
│       ├── ProductsRoutes.js
│       ├── StoresRoutes.js
│       └── UploadRoutes.js
├── .env
├── .gitignore
├── LICENSE
├── package.json
├── server.js
├── README.md
└── node_modules/
```

## Requisitos

- Node.js 18 ou superior
- MongoDB acessível por URI
- npm
- Bucket S3 da AWS configurado para upload de imagens

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
MONGO_URI=mongodb://127.0.0.1:27017/delivery
PORT=3000
JWT_SECRET=sua_chave_secreta
JWT_REFRESHSECRET=sua_chave_refresh
AWS_REGION=sa-east-1
AWS_S3_BUCKET_NAME=seu-bucket
AWS_ACCESS_KEY_ID=sua-chave
AWS_SECRET_ACCESS_KEY=sua-chave-secreta
```

> Ajuste os valores conforme o ambiente local ou de produção.

## Instalação

1. Clone o projeto:

```bash
git clone <url-do-repositorio>
cd AppDeliveryBackend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` conforme a seção acima.

## Executando a aplicação

Modo de desenvolvimento:

```bash
npm run dev
```

O servidor será iniciado com `nodemon` e escutará na porta configurada em `PORT`.

## Autenticação e autorização

As rotas protegidas utilizam os middlewares de autenticação do arquivo `src/middlewares/authMiddleware.js`.

- `authMiddleware`: valida o JWT do usuário autenticado
- `authMiddlewareAdmin`: valida JWT e exige que o usuário tenha role `admin`

O token deve ser enviado no header:

```http
Authorization: Bearer <jwt>
```

## Fluxos principais

### 1. Login e autenticação

#### POST /login
Autentica uma loja por e-mail e senha.

Body:

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
    "id": "64b8...",
    "email": "loja@exemplo.com",
    "role": "manager"
  }
}
```

#### POST /login-cnpj
Autentica a loja utilizando CNPJ e senha.

```json
{
  "cnpj": "12345678000199",
  "password": "123456"
}
```

#### POST /refresh-token
Renova o access token da loja usando o refresh token.

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

#### POST /login-admin
Autentica um administrador.

#### POST /register-admin
Cria um administrador.

```json
{
  "email": "admin@exemplo.com",
  "password": "123456",
  "role": "admin"
}
```

#### POST /refresh-token-admin
Renova o access token do administrador.

---

### 2. Gestão de lojas

#### POST /register
Cria uma nova loja. Requer autenticação de administrador.

Body:

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

A resposta retorna o identificador da loja, dados principais e uma senha temporária gerada para uso de sincronização.

#### GET /store/:slug
Busca uma loja pela slug.

#### POST /store/update-password
Atualiza a senha da loja autenticada.

```json
{
  "oldpassword": "senhaAntiga",
  "password": "novaSenha"
}
```

#### PATCH /store/status
Atualiza o status da loja (`active`), ativando ou inativando a loja autenticada.

```json
{
  "active": true
}
```

---

### 3. Produtos

#### POST /create-product
Cria ou atualiza um lote de produtos da loja autenticada. Este endpoint aceita um array de produtos e utiliza `bulkWrite` com `upsert`, permitindo inserir novos itens e atualizar os já existentes pelo campo `idProduto`.

Body:

```json
[
  {
    "idProduto": "P001",
    "descricao": "Coca-Cola 600ml",
    "precoCusto": 5.2,
    "precoVenda": 8.5,
    "estoque": 25,
    "unidade": "UN",
    "fotoUrl": "https://exemplo.com/imagem.jpg"
  },
  {
    "idProduto": "P002",
    "descricao": "X-Burger",
    "precoCusto": 10.0,
    "precoVenda": 18.5,
    "estoque": 10,
    "unidade": "UN",
    "fotoUrl": "https://exemplo.com/x-burger.jpg"
  }
]
```

Resposta resumida:

```json
{
  "message": "Lote de produtos processado com sucesso.",
  "resumo": {
    "totalRecebido": 2,
    "inseridos": 1,
    "atualizados": 1,
    "inalterados": 0
  }
}
```

#### GET /:slug/products
Retorna os produtos de uma loja por slug, com paginação.

Exemplo:

```http
GET /minha-loja/products?page=1&limit=10
```

#### PATCH /photo
Atualiza a foto de um produto específico da loja autenticada.

```json
{
  "idProduto": "P001",
  "fotoUrl": "https://bucket.s3.amazonaws.com/produtos/123/P001-1720000000000.jpg"
}
```

---

### 4. Pedidos

#### POST /create-order
Cria um pedido para uma loja pública. Este endpoint não exige autenticação e calcula o valor total com base nos produtos cadastrados da loja.

Body:

```json
{
  "storeId": "64a2a7d8b7d9e1f1f1f1f1f1",
  "items": [
    {
      "idProduto": "P001",
      "quantidade": 2
    }
  ],
  "client": {
    "nome": "João Silva",
    "telefone": "11999999999",
    "endereco": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP",
    "cep": "01000-000"
  },
  "PaymentMethod": "PIX"
}
```

> Ao criar o pedido, o sistema valida a existência dos produtos, recalcula o valor total, reduz o estoque e cria o registro do pedido.

#### GET /get-orders/
Retorna os pedidos da loja autenticada, paginados.

Exemplo:

```http
GET /get-orders/?page=1&limit=10
Authorization: Bearer <jwt>
```

---

### 5. Upload de imagens para S3

#### POST /upload/presigned-url
Gera uma URL temporária para upload direto de imagem no S3, permitindo que o cliente envie a imagem sem expor credenciais da AWS.

Body:

```json
{
  "idProduto": "P001",
  "fileType": "image/jpeg"
}
```

Resposta:

```json
{
  "uploadUrl": "https://...",
  "fileUrl": "https://bucket.s3.sa-east-1.amazonaws.com/produtos/123/P001-123456789.jpg"
}
```

Tipos permitidos:

- image/jpeg
- image/png
- image/webp

---

## Modelos principais

### Store
Campos:

- email
- cnpj
- idCliente
- fantasia
- address
- password
- passwordSync
- active
- slug
- role

### Product
Campos:

- storeId
- idProduto
- descricao
- precoCusto
- precoVenda
- estoque
- unidade
- fotoUrl
- active

### Order
Campos:

- storeId
- idCliente
- client
- items
- PaymentMethod
- total
- status
- data

### Admin
Campos:

- email
- password
- role

## Observações importantes

- O sistema utiliza `bulkWrite` para lotes de produtos, o que melhora a eficiência de cadastro e atualização em massa.
- As lojas e produtos possuem relacionamento por `storeId` e `idProduto`.
- O status da loja é controlado pelo campo `active`.
- Os pedidos publicos podem ser criados independemente de autenticação da loja, desde que a loja exista e os produtos sejam válidos.
- Os arquivos de imagem são armazenados no S3 e o link público é salvo no MongoDB junto ao produto.

## Licença

Este projeto está sob a licença definida em [LICENSE](LICENSE).
