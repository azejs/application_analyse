// routes.js
const express = require('express');
const router = express.Router();
const UserController = require('./authController');
const authenticateJWT = require('./middleware/authenticateJWT');
const authorize = require('../../config/authorize');

// Définition des routes avec authentification et autorisation
const routes = [
    {
        path: '/me',
        method: 'get',
        middlewares: [authenticateJWT], // Cette route nécessite uniquement une authentification
        handler: UserController.getCurrentUser,
    },
    {
        path: '/profile',
        method: 'get',
        middlewares: [authenticateJWT, authorize('api.get.profile')],
        handler: UserController.getProfile
    },
    // {
    //     path: '/profile',
    //     method: 'put',
    //     middlewares: [authenticateJWT, authorize('api.update.profile')],
    //     handler: UserController.updateProfile
    // },
    {
        path: '/signup',
        method: 'post',
        middlewares: [],
        handler: UserController.signup
    },
    {
        path: '/login',
        method: 'post',
        middlewares: [],
        handler: UserController.login
    },
    {
        path: '/logout',
        method: 'post',
        middlewares: [authenticateJWT],
        handler: UserController.logout
    },
    // Ajout de la route pour récupérer tous les utilisateurs avec pagination
    // {
    //     path: '/users',
    //     method: 'get',
    //     middlewares: [authenticateJWT, authorize('api.get.users')],
    //     handler: UserController.getAllUsers
    // }
];

// Attachement des routes
routes.forEach(route => {
    const method = route.method.toLowerCase();
    if (typeof router[method] === 'function') {
        router[method](route.path, ...route.middlewares, route.handler);
    } else {
        console.error(`Méthode HTTP ${route.method} n'est pas valide pour la route ${route.path}`);
    }
});

module.exports = router;
