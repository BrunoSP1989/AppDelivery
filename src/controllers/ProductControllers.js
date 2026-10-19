const Stores = require('../models/Stores');
const Product = require('../models/Products');

const roundToTwoDecimals = (valor) => {
  const num = Number(valor);
  return isNaN(num) ? 0 : Math.round(num * 100) / 100;
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
              active: true
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
    const slug = req.params.slug?.trim().toLowerCase();
    const { search } = req.query;

    if (!slug) {
      return res.status(400).json({ message: 'Slug da loja não informado.' });
    }
    const store = await Stores.findOne({ slug }).lean();
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada ou inativa.' });
    }
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));

    const options = {
      page,
      limit,
      sort: { createdAt: -1 },
      lean: true
    };

    const query = {
      store: store.id,
      active: true,
    };
    if (search) {
      query.$or = [
        { descricao: { $regex: search, $options: 'i' } }
      ];
    }

    const result = await Product.paginate(query, options);

    return res.status(200).json({
      store: { id: store.id, name: store.name },
      ...result
    });
  } catch (error) {
    console.error('Erro ao buscar produtos da loja:', error);
    return res.status(500).json({
      message: 'Erro interno ao buscar os produtos.'
    });
  }
};

exports.updateProductPhoto = async (req, res) => {
  try {
    const { id: storeId } = req.user;
    const { idProduto, fotoUrl } = req.body;

    if (!idProduto || !fotoUrl) {
      return res.status(400).json({
        message: 'idProduto e fotoUrl são obrigatórios.'
      });
    }

    const produtoAtualizado = await Product.findOneAndUpdate(
      {
        storeId,
        idProduto: String(idProduto)
      },
      {
        $set: { fotoUrl }
      },
      { new: true }
    );

    if (!produtoAtualizado) {
      return res.status(404).json({
        message: `Produto com ID ${idProduto} não encontrado para esta loja.`
      });
    }

    return res.status(200).json({
      message: 'Foto do produto atualizada com sucesso!',
      produto: produtoAtualizado
    });
  } catch (error) {
    console.error('Erro ao atualizar foto do produto:', error);
    return res.status(500).json({
      message: 'Erro interno ao atualizar a foto do produto.',
      error: error.message
    });
  }
};
