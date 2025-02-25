const { checkAccess } = require('./acl.config');

const authorize = (action) => {
    return (req, res, next) => {
        const userRole = req.user.role; // Le rôle de l'utilisateur est supposé être défini dans req.user

        if (!checkAccess(userRole, action)) {
            return res.status(403).json({ msg: "Accès refusé : vous n'avez pas les permissions nécessaires." });
        }

        next();
    };
};

module.exports = authorize;
