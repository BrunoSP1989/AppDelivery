const Stores = require('../models/Stores');
const Product = require('../models/Products');

const roundToTwoDecimals = (valor) => {
  if (valor === undefined || valor === null || isNaN(valor)) return 0;
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
};

exports.createProduct = async (req, res) => {
  try {
    const productsArray = req.body;
    const { id: storeId } = req.user;

    const store = await Stores.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada.' });
    }

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      return res.status(400).json({
        message: 'O formato dos dados deve ser um Array de produtos não vazio.'
      });
    }

    const operations = productsArray.map((item) => {
      const { idProduto, descricao, precoCusto, precoVenda, estoque, unidade, fotoUrl } = item;

      return {
        updateOne: {

          filter: {
            storeId: storeId,
            idProduto: idProduto
          },

          update: {
            $set: {
              descricao,
              precoCusto: roundToTwoDecimals(precoCusto),
              precoVenda: roundToTwoDecimals(precoVenda),
              estoque,
              unidade,
              fotoUrl,
            },

            $setOnInsert: {
              storeId: storeId,
              idProduto: idProduto,
            },
          },
          upsert: true,
        },
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: false });

    return res.status(200).json({
      message: 'Lote de produtos processado com sucesso.',
      resumo: {
        totalRecebido: productsArray.length,
        inseridos: result.upsertedCount,
        atualizados: result.modifiedCount,
        inalterados: result.matchedCount - result.modifiedCount,
      },
    });

  } catch (error) {
    console.error('Erro ao processar lote com bulkWrite:', error);
    return res.status(500).json({
      message: 'Erro interno ao processar o lote de produtos.',
      details: error.message
    });
  }
};

exports.getProductsByStore = async (req, res) => {
  try {
    const { id: storeId } = req.user;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true
    };

    const result = await Product.paginate({ storeId }, options);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);

    return res.status(500).json({
      message: 'Erro interno ao buscar os produtos.',
      details: error.message
    });
  }
};
