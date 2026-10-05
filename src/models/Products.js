const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    idProduto: {
        type: String,
        required: [true, 'O ID do produto é obrigatório.']
    },
    descricao: {
        type: String,
        required: [true, 'A descrição é obrigatória.']
    },
    precoVenda: {
        type: Number,
        required: [true, 'O preço de venda é obrigatório.'],
        default: 0
    },
    estoque: {
        type: Number,
        default: 0,
        required: [true, 'O estoque é obrigatório.']
    },
    unidade: {
        type: String,
        required: [true, 'A unidade é obrigatória.']
    },
    fotoUrl: {
        type: String,
        default: null
    }


});

module.exports = mongoose.model('Product', ProductSchema, 'Product');


