const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connectDB = require('./config/db'); // Importez la fonction de connexion DB

const indexRouter = require('./routes/index');
const app = express();

require('dotenv').config(); // Charger les variables d'environnement

// Définir si l'environnement est en production
const isProduction = process.env.NODE_ENV === 'production';

// Liste des origines autorisées (vous pouvez les ajuster en fonction de vos besoins)
const allowedOrigins = ['http://example.com', 'http://localhost:9000','http://localhost:4000'];

app.use(logger('dev'));
app.use(express.json());  // Important pour analyser le corps JSON des requêtes
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de CORS avec une gestion des environnements
const corsOptions = {
  origin: function (origin, callback) {
    // Si aucune origine n'est définie (requête venant du même domaine) ou si l'origine est autorisée
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('Origine non autorisée par CORS:', origin); // Log de l'origine qui pose problème
      callback(new Error(`Origine non autorisée par CORS: ${origin}`));
    }
  },
  credentials: true, // Autoriser les cookies d'authentification
};


app.use(cors(corsOptions)); // Utilisation de CORS avec les options définies

// Utilisation des routes principales pour l'API
app.use('/api', indexRouter); // Toutes les routes API passent par ce router

// Gestion des routes pour le frontend (React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Définition du port
const PORT = process.env.PORT || 4000;

// Connexion à la base de données et démarrage du serveur
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log('\x1b[32m%s\x1b[0m', `Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erreur lors de la connexion à la base de données:', err);
  });

module.exports = app;
