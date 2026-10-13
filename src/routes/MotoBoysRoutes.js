const express = require('express');
const router = express.Router();
const MotoBoysControllers = require('../controllers/MotoBoysControllers');
const OrdersControllers = require('../controllers/OrdersControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/store/register-motoboy', authMiddleware, MotoBoysControllers.registerMotoBoyByStore);
router.get('/:slug/motoboys', authMiddleware, MotoBoysControllers.getMotoBoyByStore);
router.patch('/orders/:orderId/motoboy', authMiddleware, orderController.assignMotoBoyToOrder);
module.exports = router;