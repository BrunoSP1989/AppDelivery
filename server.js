const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes'); // Ajuste o caminho conforme necessário
const app = express();
require('dotenv').config();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado ao MongoDB no banco: delivery'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.use('/', authRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
