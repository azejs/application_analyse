const express = require('express');
const router = express.Router();
const SubmissionController = require('./submission.controller');
const authenticateJWT = require('../Auth/middleware/authenticateJWT');
const authorize = require('../../config/authorize');

// Routes definition with authentication and authorization
const routes = [
    // Utilisateurs réguliers
    {
        path: '/',
        method: 'post',
        middlewares: [authenticateJWT, authorize('api.create.submission')],
        handler: SubmissionController.submitItem
    },
    {
        path: '/',
        method: 'get',
        middlewares: [authenticateJWT, authorize('api.get.submission')],
        handler: SubmissionController.getAllSubmissions
    },
    // {
    //     path: '/:id',
    //     method: 'put',
    //     middlewares: [authenticateJWT, authorize('api.update.submission')],
    //     handler: SubmissionController.updateSubmission
    // },
    // {
    //     path: '/:id',
    //     method: 'delete',
    //     middlewares: [authenticateJWT, authorize('api.delete.submission')],
    //     handler: SubmissionController.deleteSubmission
    // },
   
    
 
];

// Attaching routes dynamically
routes.forEach(route => {
    const method = route.method.toLowerCase();
    if (typeof router[method] === 'function') {
        router[method](route.path, ...route.middlewares, route.handler);
    } else {
        console.error(`Méthode HTTP ${route.method} n'est pas valide pour la route ${route.path}`);
    }
});

module.exports = router;
