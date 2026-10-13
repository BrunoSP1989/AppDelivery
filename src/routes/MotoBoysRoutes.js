const express = require('express');
const router = express.Router();
const MotoBoysControllers = require('../controllers/MotoBoysControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/store/register-motoboy', authMiddleware, MotoBoysControllers.registerMotoBoyByStore);
router.get('/:slug/motoboys', authMiddleware, MotoBoysControllers.getMotoBoyByStore);
module.exports = router;