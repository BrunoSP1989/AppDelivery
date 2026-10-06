const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const AdminRoutes = require('./src/routes/AdminRoutes');
const ProductsRoutes = require('./src/routes/ProductsRoutes');
const StoreRoutes = require('./src/routes/StoresRoutes');
const app = express();
require('dotenv').config();

app.use(express.json({ limit: '5mb' }));


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB no banco: delivery'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.use('/', authRoutes);
app.use('/', AdminRoutes);
app.use('/', ProductsRoutes);
app.use('/', StoreRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
