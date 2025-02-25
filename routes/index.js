const express = require('express');
const router = express.Router();

const AuthRoutes = require('./../modules/Auth/user.routes');

// Middleware pour gérer l'authentification avant toute autre route
const authenticateJWT = require('./../modules/Auth/middleware/authenticateJWT');

// Utiliser les routes d'authentification
router.use('/auth', AuthRoutes);

// Utiliser les routes des niveaux avec l'authentificationssss
//router.use('/niveaux', authenticateJWT, NiveauxRoutes);
// Utiliser les routes des niveaux avec l'authentification
//router.use('/demandes', authenticateJWT, DemandeRoutes);

module.exports = router;
