const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rota para criar o produto
router.post('/create-product', authMiddleware, ProductController.createProduct);
// Rota para buscar os produtos da loja
router.get('/get-products', authMiddleware, ProductController.getProductsByStore);
module.exports = router;