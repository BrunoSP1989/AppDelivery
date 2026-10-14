const express = require('express');
const router = express.Router();
const MotoBoysControllers = require('../controllers/MotoBoysControllers');
const OrdersControllers = require('../controllers/OrdersControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/store/register-motoboy', authMiddleware, MotoBoysControllers.registerMotoBoyByStore);
router.get('/:slug/motoboys', authMiddleware, MotoBoysControllers.getMotoBoyByStore);
router.get('/:slug/motoboys-commission', authMiddleware, MotoBoysControllers.getMotoBoysCommissionByStore);
router.patch('/orders/:orderId/motoboy', authMiddleware, OrdersControllers.assignMotoBoyToOrder);
module.exports = router;