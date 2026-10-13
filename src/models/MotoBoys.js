const mongoose = require('mongoose');

const roundToTwoDecimals = (valor) => {
    if (valor === undefined || valor === null) return valor;
    const num = Number(valor);
    return isNaN(num) ? valor : Math.round((num + Number.EPSILON) * 100) / 100;
};

const motoboySchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true,
            index: true
        },
        name: {
            type: String,
            required: [true, 'O nome do motoboy é obrigatório.'],
            trim: true
        },
        commission: {
            type: Number,
            default: 0.0,
            min: [0, 'A comissão não pode ser negativa.'],
            set: roundToTwoDecimals
        },
        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

motoboySchema.index({ storeId: 1, active: 1 });

module.exports = mongoose.model('MotoBoy', motoboySchema, 'MotoBoys');