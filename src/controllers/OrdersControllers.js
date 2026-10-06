const mongoose = require('mongoose');
const Store = require('../models/Stores');
const Product = require('../models/Products');
const Order = require('../models/Orders');

exports.createPublicOrder = async (req, res) => {
    try {
        const { storeId, items } = req.body;

        if (!storeId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Dados incompletos.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        let calculatedTotal = 0;
        const orderItems = [];


        for (const item of items) {
            const qtdComprada = Number(item.quantidade);

            const produtoAtualizado = await Product.findOneAndUpdate(
                {
                    storeId: store._id,
                    idProduto: String(item.idProduto)
                },
                {
                    $inc: { estoque: -qtdComprada }
                },
                { new: true }
            );

            if (!produtoAtualizado) {
                return res.status(404).json({
                    message: `Produto não encontrado: ID ${item.idProduto}`
                });
            }

            const precoUnit = Number(produtoAtualizado.precoVenda);
            if (produtoAtualizado.precoVenda === undefined || produtoAtualizado.precoVenda === null || isNaN(precoUnit)) {
                return res.status(400).json({
                    message: `O produto ID ${item.idProduto} (${produtoAtualizado.descricao}) não possui um preço de venda válido cadastrado.`
                });
            }

            calculatedTotal += precoUnit * qtdComprada;

            orderItems.push({
                idProduto: produtoAtualizado.idProduto,
                descricao: produtoAtualizado.descricao,
                quantidade: qtdComprada,
                precoVenda: precoUnit
            });
        }

        const newOrder = await Order.create({
            storeId: store._id,
            idCliente: store.idCliente,
            items: orderItems,
            total: calculatedTotal
        });

        return res.status(201).json(newOrder);

    } catch (error) {
        console.error('Erro na criação do pedido:', error);
        return res.status(500).json({
            message: 'Erro ao processar o pedido.',
            error: error.message
        });
    }
};

exports.getOrdersByStore = async (req, res) => {
    try {
        const { id: storeId } = req.user;

        const orders = await Order.find({ storeId })
            .select('status total createdAt items.idProduto items.descricao items.quantidade items.precoVenda data')
            .lean();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Nenhum pedido encontrado para esta loja.' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos 1:', error);
        return res.status(500).json({
            message: 'Erro ao buscar pedidos 2.',
            error: error.message
        });
    }
};