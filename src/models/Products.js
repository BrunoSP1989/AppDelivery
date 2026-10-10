const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const roundToTwoDecimals = (valor) => {
    if (valor === undefined || valor === null) return valor;
    return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
};

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
    precoCusto: {
        type: Number,
        default: 0.0,
        set: roundToTwoDecimals
    },
    precoVenda: {
        type: Number,
        required: [true, 'O preço de venda é obrigatório.'],
        default: 0.0,
        set: roundToTwoDecimals
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
    },
    active:{
        type: Boolean,
        default: true
    }
});
ProductSchema.plugin(mongoosePaginate);
ProductSchema.index({ storeId: 1, idProduto: 1 }, { unique: true });
module.exports = mongoose.model('Product', ProductSchema, 'Product');


