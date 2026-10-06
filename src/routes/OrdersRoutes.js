const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/OrdersControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rota para criar um pedido público
router.post('/create-order', OrdersController.createPublicOrder);
// Rota para obter pedidos por ID da loja
router.get('/get-orders/',authMiddleware, OrdersController.getOrdersByStore);

module.exports = router;