const Stores = require('../models/Stores');
const Product = require('../models/Products');

exports.createProduct = async (req, res) => {
    try {
        const productsArray = req.body; // Agora recebe a lista pura do Delphi
        const { id: storeId } = req.user;

        // 1. Valida se a loja existe (apenas uma vez para economizar banco)
        const store = await Stores.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        // 2. Valida se o que veio do Delphi é realmente uma lista/array
        if (!Array.isArray(productsArray)) {
            return res.status(400).json({ message: 'O formato dos dados deve ser um Array de produtos.' });
        }

        const produtosSalvos = [];
        const erros = [];

        // 3. Percorre a lista de produtos enviada pelo Delphi
        for (const item of productsArray) {
            const { idProduto, descricao, precoVenda, estoque, unidade, fotoUrl } = item;

            // Pula ou avisa se o produto já existir nesta loja
            const existingProduct = await Product.findOne({ idProduto: idProduto, storeId: storeId });
            if (existingProduct) {
                erros.push({ idProduto, message: 'Produto já existe nesta loja.' });
                continue; // Pula para o próximo produto da lista
            }

            // Cria a instância do novo produto
            const product = new Product({
                storeId: storeId,
                idProduto,
                descricao,
                precoVenda,
                estoque,
                unidade,
                fotoUrl
            });

            await product.save();
            produtosSalvos.push(product);
        }

        // 4. Retorna o status 201 com o resumo do que foi processado
        return res.status(201).json({
            message: `${produtosSalvos.length} produtos criados com sucesso.`,
            sucessos: produtosSalvos,
            erros: erros
        });

    } catch (error) {
        console.error(error); // Ajuda você a ver o erro real no CMD do Node
        return res.status(400).json({ message: 'Erro ao processar o lote de produtos.' });
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