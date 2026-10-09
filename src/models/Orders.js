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
    client: {
      nome: { type: String, required: true, trim: true },
      telefone: { type: String, required: true, trim: true },
      endereco: { type: String, required: true, trim: true },
      numero: { type: String, required: true, trim: true },
      bairro: { type: String, required: true, trim: true },
      cidade: { type: String, required: true, trim: true },
      estado: { type: String, required: true, trim: true },
      cep: { type: String }
    },
    items: [
      {
        idProduto: { type: String, required: true },
        descricao: { type: String, required: true },
        quantidade: { type: Number, required: true },
        precoVenda: { type: Number, required: true }
      }
    ],
    PaymentMethod: {
      type: String, enum: ['DINHEIRO', 'CARTAO_CREDITO','CARTAO_DEBITO','TICKET', 'PIX'], required: true
    },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['PENDENTE', 'EM ROTA', 'ENTREGUE', 'CANCELADO'],
      default: 'PENDENTE'
    },
    data: { type: String, default: getPtBrDate }
  }

);
OrderSchema.index({ storeId: 1, status: 1 });
module.exports = mongoose.model('Order', OrderSchema, 'Orders');