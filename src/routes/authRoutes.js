const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authControllers');
const StoreController = require('../controllers/storeControllers');
const adminController = require('../controllers/AdminControllers');
const ProductController = require('../controllers/ProductControllers');
const {authMiddleware,authMiddlewareAdmin} = require('../middlewares/authMiddleware');

// Rota de Login
router.post('/login', AuthController.login);
// Rota de Login Admin
router.post('/login-admin', AuthController.loginAdmin);
// Rota para criar um novo administrador
router.post('/register-admin', adminController.registerAdmin);

// Rota para criar a loja
router.post('/register',authMiddlewareAdmin, StoreController.registerStore);
// Rota para atualizar a senha do usuário
router.post('/store-update-password/:id', authMiddleware, StoreController.updatePasswordStoreById);
// Rota do Refresh Token
router.post('/refresh-token', AuthController.refreshToken);
// Rota do Refresh Token Admin
router.post('/refresh-token-admin', AuthController.refreshTokenAdmin);
//Rota para obter informações da loja pelo ID
router.get('/store/:id', StoreController.getStoresById);
// Rota para criar o produto
router.post('/create-product', authMiddleware, ProductController.createProduct);
// Rota para atualizar o produto
router.patch('/update-product/:id', authMiddleware, ProductController.updateProduct);

module.exports = router;
