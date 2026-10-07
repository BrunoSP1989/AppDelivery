const Stores = require('../models/Stores');
const Product = require('../models/Products');

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
      const { idProduto, descricao, precoVenda, estoque, unidade, fotoUrl } = item;

      return {
        updateOne: {

          filter: {
            storeId: storeId,
            idProduto: idProduto
          },

          update: {
            $set: {
              descricao,
              precoVenda,
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
    const products = await Product.find({ storeId: storeId });

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado para esta loja.' });
    }

    return res.status(200).json(products);
  }
  catch (error) {
    console.error('Erro ao buscar produtos:', error);

    return res.status(500).json({
      message: 'Erro interno ao buscar os produtos.',
      details: error.message
    });
  }
};
