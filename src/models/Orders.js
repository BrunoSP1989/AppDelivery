const mongoose = require('mongoose');

const getPtBrDate = () => {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date());
};

const OrderSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true
    },
    idCliente: {
      type: String,
      required: true,
      index: true
    },
    items: [
      {
        idProduto: { type: String, required: true },
        descricao: { type: String, required: true },
        quantidade: { type: Number, required: true },
        precoVenda: { type: Number, required: true }
      }
    ],
    total: { type: Number, required: true },
    status: { type: String, default: 'PENDENTE' },
    data: { type: String, default: getPtBrDate }
  }

);

module.exports = mongoose.model('Order', OrderSchema, 'Orders');