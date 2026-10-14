const MotoBoys = require('../models/MotoBoys');
const Store = require('../models/Stores');
const Orders = require('../models/Orders')

exports.registerMotoBoyByStore = async (req, res) => {
    try {
        const { id: storeId } = req.user;
        const { name, commission } = req.body;

        if (!name || commission === undefined || commission === null) {
            return res.status(400).json({ message: 'Nome e comissão são obrigatórios.' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada.' });
        }

        const motoBoyExists = await MotoBoys.findOne({
            storeId,
            name: name.trim()
        });

        if (motoBoyExists) {
            return res.status(400).json({ message: 'Este motoboy já está cadastrado nesta loja.' });
        }

        const newMotoBoy = new MotoBoys({
            storeId,
            name,
            commission
        });

        await newMotoBoy.save();

        return res.status(201).json({
            message: 'Motoboy cadastrado com sucesso!',
            motoboy: {
                id: newMotoBoy._id,
                name: newMotoBoy.name,
                commission: newMotoBoy.commission
            }
        });

    } catch (error) {
        console.error('Erro ao cadastrar motoboy:', error);
        return res.status(500).json({
            message: 'Erro interno ao criar o motoboy na loja.',
            error: error.message
        });
    }
};

exports.getMotoBoyByStore = async (req, res) => {
    try {
        const slug = req.params.slug?.trim().toLowerCase();

        if (!slug) {
            return res.status(400).json({ message: 'Slug da loja não informado.' });
        }

        const store = await Store.findOne({ slug }).lean();
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada ou inativa.' });
        }

        const motoBoys = await MotoBoys.find({ storeId: store._id })
            .select('_id name commission')
            .lean();

        return res.status(200).json(motoBoys);

    } catch (error) {
        console.error('Erro ao buscar motoboys da loja:', error);
        return res.status(500).json({
            message: 'Erro interno ao buscar os motoboys da loja.',
            error: error.message
        });
    }
};

exports.getMotoBoysCommissionByStore = async (req, res) => {
    try {
        const slug = req.params.slug?.trim().toLowerCase();
        if (!slug) {
            return res.status(400).json({ message: 'Slug da loja não informado.' });
        }

        const store = await Store.findOne({ slug }).lean();
        if (!store) {
            return res.status(404).json({ message: 'Loja não encontrada ou inativa.' });
        }

        const relatorioComissoes = await Orders.aggregate([
            {
                $match: {
                    storeId: store._id
                }
            },

            {
                $group: {
                    _id: "$motoboyId",
                    totalPedidos: { $sum: 1 }
                }
            },

            {
                $lookup: {
                    from: "MotoBoys",
                    localField: "_id",
                    foreignField: "_id",
                    as: "dadosEntregador"
                }
            },

            {
                $unwind: "$dadosEntregador"
            },

            {
                $project: {
                    _id: 0,
                    entregadorId: "$_id",
                    nomeEntregador: "$dadosEntregador.name", // Ajustado de .nome para .name
                    valorComissaoUnitaria: "$dadosEntregador.commission", // Ajustado de .comissao para .commission
                    totalPedidos: 1,
                    totalAReceber: {
                        $multiply: ["$totalPedidos", "$dadosEntregador.commission"]
                    }
                }
            }
        ]);

        return res.status(200).json(relatorioComissoes);

    } catch (error) {
        console.error('Erro ao buscar comissão dos motoboys:', error);
        return res.status(500).json({
            message: 'Erro interno ao buscar as comissões.',
            error: error.message
        });
    }
};
