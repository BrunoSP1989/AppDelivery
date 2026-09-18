const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token não fornecido." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou Expirado." });
    }
}
function authMiddlewareAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Token não fornecido." });
        }
        const token = authHeader.split(" ")[1];
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