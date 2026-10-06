const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');

// Rota de Login
router.post('/login', AuthController.login);
// Rota de Login Com CNPJ
router.post('/login-cnpj', AuthController.loginWithCnpj);
// Rota do Refresh Token
router.post('/refresh-token', AuthController.refreshToken);

module.exports = router;
