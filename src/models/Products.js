const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({

    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    descricao: {
        type: String,
        required: [true, 'A descrição é obrigatória.']
    },
    precoVenda: {
        type: Number,
        required: [true, 'O preço de venda é obrigatório.'],
        min: [0.01, 'O preço de venda deve ser maior que zero.']
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


