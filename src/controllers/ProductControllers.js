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
          // Filtro: isolamento por loja e código do produto
          filter: { 
            storeId: storeId, 
            idProduto: idProduto 
          },
          // Dados a serem atualizados se já existir (ou inseridos se for novo)
          update: {
            $set: {
              descricao,
              precoVenda,
              estoque,
              unidade,
              fotoUrl,
            },
            // Dados gravados EXCLUSIVAMENTE no momento da criação
            $setOnInsert: {
              storeId: storeId,
              idProduto: idProduto,
            },
          },
          // Cria o documento se não existir, atualiza se já existir
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

