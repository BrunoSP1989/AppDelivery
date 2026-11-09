const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Rota de Login
router.post('/login', AuthController.login);
// Rota de Login Com CNPJ
router.post('/login-cnpj', AuthController.loginWithCnpj);
// Rota do Refresh Token
router.post('/refresh-token', AuthController.refreshToken);
//rota para fazer lougout
router.post('/logout', AuthController.logout);
// Rota para verificar se o usuário está logado
router.get('/me', authMiddleware, AuthController.getMe);


module.exports = router;
