const jwt = require("jsonwebtoken");

function getToken(req) {
    if (req.cookies?.access_token) return req.cookies.access_token;

    const authHeader = req.headers.authorization;
    if (authHeader) return authHeader.split(" ")[1];

    return null;
}

function authMiddleware(req, res, next) {
    try {
        const token = getToken(req);
        if (!token) {
            return res.status(401).json({ message: "Token não fornecido." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou Expirado." });
    }
}

function authMiddlewareAdmin(req, res, next) {
    try {
        const token = getToken(req);
        if (!token) {
            return res.status(401).json({ message: "Token não fornecido." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar esta rota." });
        }
        req.user = decoded;
        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Token inválido ou Expirado." });
    }
}

exports.authMiddleware = authMiddleware;
exports.authMiddlewareAdmin = authMiddlewareAdmin;