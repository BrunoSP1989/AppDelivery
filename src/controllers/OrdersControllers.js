const mongoose = require('mongoose');
const Store = require('../models/Stores');
const Product = require('../models/Products');
const Order = require('../models/Orders');

exports.createPublicOrder = async (req, res) => {
    try {
        const { storeId, items, client, PaymentMethod } = req.body;

        if (!storeId || !Array.isArray(items) || items.length === 0 || !client
            || !client.nome || !client.telefone || !client.endereco
            || !client.numero || !client.bairro
            || !client.cidade || !client.estado || !PaymentMethod) {
            return res.status(400).json({ message: 'Dados incompletos.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        const idsProdutos = items.map((item) => String(item.idProduto));
        const produtosCadastrados = await Product.find({
            storeId: store.id,
            idProduto: { $in: idsProdutos }
        });

        const mapaProdutos = new Map(
            produtosCadastrados.map((prod) => [prod.idProduto, prod])
        );

        let calculatedTotal = 0;
        const orderItems = [];
        const bulkOperations = [];

        for (const item of items) {
            const idStr = String(item.idProduto);
            const qtdComprada = Number(item.quantidade);
            const produto = mapaProdutos.get(idStr);

            if (!produto) {
                return res.status(404).json({
                    message: `Produto não encontrado: ID ${item.idProduto}`
                });
            }

            const precoUnit = Number(produto.precoVenda);
            if (produto.precoVenda === undefined || produto.precoVenda === null || isNaN(precoUnit)) {
                return res.status(400).json({
                    message: `O produto ID ${item.idProduto} (${produto.descricao}) não possui um preço de venda válido cadastrado.`
                });
            }

            calculatedTotal += precoUnit * qtdComprada;

            orderItems.push({
                idProduto: produto.idProduto,
                descricao: produto.descricao,
                quantidade: qtdComprada,
                precoVenda: precoUnit
            });

            bulkOperations.push({
                updateOne: {
                    filter: {
                        storeId: store.id,
                        idProduto: idStr
                    },
                    update: {
                        $inc: { estoque: -qtdComprada }
                    }
                }
            });
        }

        await Product.bulkWrite(bulkOperations, { ordered: false });

        const newOrder = await Order.create({
            storeId: store.id,
            idCliente: store.idCliente,
            items: orderItems,
            client: {
                nome: client.nome,
                telefone: client.telefone,
                endereco: client.endereco,
                numero: client.numero,
                bairro: client.bairro,
                cidade: client.cidade,
                estado: client.estado,
                cep: client.cep || ''
            },
            PaymentMethod: req.body.PaymentMethod,
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
        if (!storeId) {
            return res.status(400).json({ message: 'ID da loja não fornecido.' });
        }

        const orders = await Order.find({ storeId })
            .select('status total createdAt client.nome client.telefone client.endereco client.numero client.bairro client.cidade client.estado client.cep items.idProduto items.descricao items.quantidade items.precoVenda data')
            .lean();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Nenhum pedido encontrado para esta loja.' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({
            message: 'Erro ao buscar pedidos.',
            error: error.message
        });
    }
};