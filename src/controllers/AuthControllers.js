const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Stores = require('../models/Stores');
const Admin = require('../models/Admin');
const refreshtoken = require('../models/RefreshToken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESHSECRET = process.env.JWT_REFRESHSECRET

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const store = await Stores.findOne({ email });
        if (!store) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos' });
        }

        const isPasswordValid = await bcrypt.compare(password, store.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: store._id, role: store.role },
            JWT_SECRET,
            { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { id: store._id },
            JWT_REFRESHSECRET,
            { expiresIn: '7d' }
        );
        await refreshtoken.create({
            refreshToken: refreshToken,
            storeId: store._id
        });

        return res.status(200).json({
            token,
            refreshToken,
            store: {
                id: store._id,
                email: store.email,
                role: store.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
};
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos' });
        }

        const token = jwt.sign(
            { id: admin._id, role: admin.role },
            JWT_SECRET,
            { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { id: admin._id },
            JWT_REFRESHSECRET,
            { expiresIn: '7d' }
        );
        await refreshtoken.create({
            refreshToken: refreshToken,
            storeId: admin._id
        });

        return res.status(200).json({
            token,
            refreshToken,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro interno no servidor' });
    }
};
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ message: 'Refresh Token é obrigatório' });

        const savedToken = await refreshtoken.findOne({ refreshToken: refreshToken });

        if (!savedToken) return res.status(403).json({ message: 'Refresh Token inválido ou expirado' });

        jwt.verify(refreshToken, JWT_REFRESHSECRET, async (err, decoded) => {

            if (err) return res.status(403).json({ message: 'Refresh Token inválido ou expirado' });

            const store = await Stores.findById(decoded.id);

            if (!store) return res.status(404).json({ message: 'Lojista não encontrado' });

            const newAccessToken = jwt.sign(
                { id: store._id, role: store.role },
                JWT_SECRET,
                { expiresIn: '30m' }
            );

            return res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao renovar token' });
    }
};
exports.refreshTokenAdmin = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) return res.status(401).json({ message: 'Refresh Token é obrigatório' });

        const savedToken = await refreshtoken.findOne({ refreshToken: refreshToken });

        if (!savedToken) return res.status(403).json({ message: 'Refresh Token inválido ou expirado' });

        jwt.verify(refreshToken, JWT_REFRESHSECRET, async (err, decoded) => {

            if (err) return res.status(403).json({ message: 'Refresh Token inválido ou expirado' });

            const admin = await Admin.findById(decoded.id);

            if (!admin) return res.status(404).json({ message: 'Administrador não encontrado' });

            const newAccessToken = jwt.sign(
                { id: admin._id, role: admin.role },
                JWT_SECRET,
                { expiresIn: '30m' }
            );

            return res.status(200).json({ accessToken: newAccessToken });
        });

    } catch (error) {
        return res.status(500).json({ message: 'Erro ao renovar token' });
    }
};





