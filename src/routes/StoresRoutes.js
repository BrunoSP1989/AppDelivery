const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/StoreControllers');
const { authMiddleware, authMiddlewareAdmin } = require('../middlewares/authMiddleware');


// Rota para criar a loja
router.post('/register', authMiddlewareAdmin, StoreController.registerStore);
// Rota para atualizar a senha do usuário
router.post('/store-update-password/:id', authMiddleware, StoreController.updatePasswordStoreById);
//Rota para obter informações da loja pelo ID
router.get('/store/:id', StoreController.getStoresById);
module.exports = router;