const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrdersControllers');

// Rota para criar um pedido público
router.post('/create-order', OrderController.createPublicOrder);
module.exports = router;