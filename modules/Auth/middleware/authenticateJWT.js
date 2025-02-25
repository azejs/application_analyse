const jwt = require('jsonwebtoken');

// Middleware pour vérifier et décoder le jeton JWT
const authenticateJWT = (req, res, next) => {
    let token;

    // Récupérer le token depuis les cookies ou les en-têtes de requête
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.header('Authorization') && req.header('Authorization').startsWith('Bearer ')) {
        token = req.header('Authorization').replace('Bearer ', '');
    }

    if (!token) {
        // Ajouter un en-tête WWW-Authenticate pour indiquer qu'un token est nécessaire
        res.setHeader('WWW-Authenticate', 'Bearer');
        return res.status(401).json({ msg: "Accès refusé : aucun token fourni." });
    }

    try {
        // Vérifier et décoder le token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attacher l'objet utilisateur décodé à la requête pour utilisation future
        req.user = decoded.user;

        // Passer au middleware suivant
        next();
    } catch (err) {
        console.error('Erreur de validation du token JWT:', err.message);
        return res.status(401).json({ msg: "Token invalide. Accès refusé." });
    }
};

module.exports = authenticateJWT;
