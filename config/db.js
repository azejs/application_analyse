const mongoose = require('mongoose');

const dbURL = 'mongodb://localhost:27017/dbacti'; // URL de la base de données

// Connexion à MongoDB sans utiliser les options obsolètes et les callbacks
const connectDB = async () => {
    try {
        await mongoose.connect(dbURL);
        console.log('MongoDB Connection Succeeded.');
    } catch (err) {
        console.log('Error in DB connection : ' + err);
        process.exit(1); // Quitter le processus avec une erreur en cas de défaillance de connexion
    }
}

module.exports = connectDB; // Exporter la fonction de connexion
