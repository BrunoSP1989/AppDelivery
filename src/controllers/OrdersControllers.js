const mongoose = require('mongoose');
const Store = require('../models/Stores');
const Product = require('../models/Products');
const Order = require('../models/Orders');
const MotoBoys = require('../models/MotoBoys');

exports.createPublicOrder = async (req, res) => {
    try {
        const { storeId, items, client, PaymentMethod } = req.body;

        if (!storeId || !Array.isArray(items) || items.length === 0 || !client
            || !client.nome || !client.telefone || !client.endereco
            || !client.numero || !client.bairro
            || !client.cidade || !client.estado || !PaymentMethod) {
            return res.status(400).json({ message: 'Dados incompletos.' });
        }
        if (!mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'Loja inválida.' });
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
            const idString = String(item.idProduto);
            const qtdComprada = Number(item.quantidade);
            const produto = mapaProdutos.get(idString);

            if (!produto) {
                return res.status(404).json({
                    message: `Produto não encontrado: ID ${item.idProduto}`
                });
            }
            const qtdValida = Number.isFinite(qtdComprada) && qtdComprada > 0;
            if (!qtdValida) {
                return res.status(400).json({
                    message: `Quantidade inválida para o produto ID ${item.idProduto} (${produto.descricao}).`
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
                        idProduto: idString
                    },
                    update: {
                        $inc: { estoque: -qtdComprada }
                    }
                }
            });
        }

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

        try {
            const resultado = await Product.bulkWrite(bulkOperations, { ordered: false });

            if (resultado.matchedCount !== bulkOperations.length) {
                console.error(
                    `Baixa divergente no pedido ${newOrder._id}: ` +
                    `esperado ${bulkOperations.length}, encontrado ${resultado.matchedCount}`
                );
            }
        } catch (erro) {
            console.error(
                `Falha na baixa de estoque do pedido ${newOrder._id}. ` +
                `Aplicadas: ${erro.result?.modifiedCount ?? 'desconhecido'} de ${bulkOperations.length}`,
                erro
            );
        }

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
        if (!storeId || !mongoose.Types.ObjectId.isValid(storeId)) {
            return res.status(400).json({ message: 'ID da loja inválido ou ausente.' });
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
        const { status } = req.query;

        const query = { storeId };
        if (status) {
            query.status = status;
        }

        const options = {
            page,
            limit,
            sort: { _id: -1 },
            select: 'status total createdAt client.nome client.telefone client.endereco client.numero client.bairro client.cidade client.estado client.cep items.idProduto items.descricao items.quantidade items.precoVenda data motoboyId',
            populate: {
                path: 'motoboyId',
                select: 'name commission active'
            },
            lean: true
        };

        const result = await Order.paginate(query, options);
        return res.status(200).json(result);

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return res.status(500).json({
            message: 'Erro ao buscar pedidos.',
            error: error.message
        });
    }
};

exports.assignMotoBoyToOrder = async (req, res) => {
    try {
        const { id: storeId } = req.user;
        const { orderId } = req.params;
        const { motoboyId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(motoboyId)) {
            return res.status(400).json({ message: 'Identificador de pedido ou motoboy inválido.' });
        }

        const motoboy = await MotoBoys.findOne({ _id: motoboyId, storeId, active: true }).lean();
        if (!motoboy) {
            return res.status(404).json({
                message: 'Motoboy não encontrado ou inativo para esta loja.'
            });
        }
        const updatedOrder = await Order.findOneAndUpdate(
            {
                _id: orderId,
                storeId,
                status: 'PENDENTE'
            },
            {
                $set: {
                    motoboyId: motoboy._id,
                    status: 'EM ROTA'
                }
            },
            { new: true }
        ).populate('motoboyId', 'name commission active');

        if (!updatedOrder) {
            return res.status(404).json({
                message: 'Pedido não encontrado ou não está elegível para despacho (status deve ser PENDENTE).'
            });
        }

        return res.status(200).json({
            message: 'Motoboy vinculado ao pedido com sucesso!',
            order: updatedOrder
        });

    } catch (error) {
        console.error('Erro ao vincular motoboy ao pedido:', error);
        return res.status(500).json({
            message: 'Erro interno ao vincular motoboy ao pedido.',
            error: error.message
        });
    }
};