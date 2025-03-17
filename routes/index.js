const express = require('express');
const router = express.Router();
const authenticateJWT = require('./../modules/Auth/middleware/authenticateJWT');
const AuthRoutes = require('./../modules/Auth/user.routes');
const SubmissionRoutes = require('./../modules/Submission/submission.routes');
// Middleware pour gérer l'authentification avant toute autre route


// Utiliser les routes d'authentification
router.use('/auth', AuthRoutes);
router.use('/submission', authenticateJWT, SubmissionRoutes);
// Utiliser les routes des niveaux avec l'authentificationssss
//router.use('/niveaux', authenticateJWT, NiveauxRoutes);
// Utiliser les routes des niveaux avec l'authentification
//router.use('/demandes', authenticateJWT, DemandeRoutes);

module.exports = router;
