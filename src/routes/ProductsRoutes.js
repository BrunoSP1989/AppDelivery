const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rota para criar o produto
router.post('/create-product', authMiddleware, ProductController.createProduct);
// Rota para buscar os produtos da loja
router.get('/:slug/products', ProductController.getProductsByStore);
// Rota para gravar o link da foto
router.patch('/photo', authMiddleware, ProductController.updateProductPhoto);
module.exports = router;