const Stores = require('../models/Stores');
const Product = require('../models/Products');

exports.createProduct = async (req, res) => {
    try {

        const { id, descricao, precoVenda, estoque, unidade, fotoUrl } = req.body;
        const { id: storeId } = req.user;
        const store = await Stores.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }
        if (id) {
            const productExists = await Product.findOne({
                _id: id,
                storeId: storeId
            });

            if (productExists) {
                return res.status(409).json({ message: 'Este produto já está cadastrado nesta loja.' });
            }
        }

        const product = new Product({
            ...(id && { _id: id }),
            storeId: storeId,
            descricao,
            precoVenda,
            estoque,
            unidade,
            fotoUrl
        });

        await product.save();
        return res.status(201).json(product);

    } catch (error) {
        return res.status(400).json({ message: 'Erro ao criar o produto.' });
    }
};
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id.trim() === '') {
            return res.status(400).json({
                message: 'ID do produto é obrigatório.'
            });
        }

        const { id: storeId } = req.user;
        const { descricao, precoVenda, estoque, unidade, fotoUrl } = req.body;
        const updateData = {};

        if (descricao !== undefined) updateData.descricao = descricao;
        if (precoVenda !== undefined) updateData.precoVenda = precoVenda;
        if (estoque !== undefined) updateData.estoque = estoque;
        if (unidade !== undefined) updateData.unidade = unidade;
        if (fotoUrl !== undefined) updateData.fotoUrl = fotoUrl;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: 'Nenhum campo válido enviado.'
            });
        }

        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: id,
                storeId: storeId
            },
            {
                $set: updateData
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                message: 'Produto não encontrado nesta loja.'
            });
        }
        return res.status(200).json(updatedProduct);
    } catch (error) {
        return res.status(400).json({
            message: 'Erro ao atualizar o produto.'
        });
    }
};