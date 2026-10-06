const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthControllers');
const adminController = require('../controllers/AdminControllers');

// Rota de Login Admin
router.post('/login-admin', AuthController.loginAdmin);
// Rota para criar um novo administrador
router.post('/register-admin', adminController.registerAdmin);
// Rota do Refresh Token Admin
router.post('/refresh-token-admin', AuthController.refreshTokenAdmin);