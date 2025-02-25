const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
//const Niveau = require('../Niveaux/niveau.model'); // Importer le modèle Niveau
// Inscription d'un utilisateur

// Récupérer les informations de l'utilisateur connecté (vérification de l'authentification)
exports.getCurrentUser = async (req, res) => {
    try {
        // Récupérer l'utilisateur connecté à partir de l'ID stocké dans req.user
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé." });
        }

        // Envoyer les informations de l'utilisateur en réponse
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            compte: user.compte,
            address: user.address,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            institution: user.institution,
            educationLevel: user.educationLevel,
            diploma: user.diploma,
            languages: user.languages,
            role: user.role,
            avatar: user.avatar || null,
        });
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err.message);
        res.status(500).send("Erreur du serveur.");
    }
};


// Inscription d'un utilisateur
exports.signup = async (req, res) => {
  
    try {
        const { matricule, cin,compte,firstName,lastName, password, role } = req.body;
        let user = await User.findOne({ matricule });

        if (user) {
            return res.status(400).json({ msg: "L'utilisateur existe déjà." });
        }

        // Création d'un nouvel utilisateur avec un rôle par défaut 'user'
        user = new User({ 
            matricule, 
            cin, 
            compte, 
            firstName, 
            lastName, 
            password, 
            role: role || 'user' 
        });

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();


        // Générer un token JWT
        const payload = { user: { id: user.id, role: user.role } };
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }, (err, token) => {
            if (err) throw err;
            // Stocker le token dans un cookie sécurisé
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000, // 1 heure en millisecondes
            });
            res.status(201).json({
                msg: "Inscription réussie",
                role: user.role
            });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur.");
    }
};

// Connexion d'un utilisateur


exports.login = async (req, res) => {
  try {
    const { compte, password } = req.body;
   console.log("compte, password reçus aux frontend",compte, password);
    // Validation pour vérifier si l'compte et le mot de passe sont fournis
    if (!compte || !password) {
      return res.status(400).json({ msg: "compte et mot de passe sont requis." });
    }

    // Recherche de l'utilisateur par compte
    const user = await User.findOne({ compte });
    if (!user) {
      return res.status(400).json({ msg: "Identifiants invalides." });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Identifiants invalides." });
    }

    // Génération du token JWT
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h' // Utilisation d'une valeur par défaut si non définie
    });

    // Stocker le token dans un cookie sécurisé
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Seulement en HTTPS en production
      sameSite: 'Strict',
      maxAge: 3600000, // 1 heure en millisecondes
    });

    // Envoi de la réponse avec le rôle de l'utilisateur et le token
    return res.status(200).json({
      msg: "Connexion réussie",
      role: user.role,
      token,
    });

  } catch (err) {
    console.error("Erreur lors de la connexion :", err.message);
    return res.status(500).json({ msg: "Erreur du serveur." });
  }
};


// Déconnexion d'un utilisateur
exports.logout = (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ msg: "Déconnexion réussie." });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur.");
    }
};

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé." });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur.");
    }
};

// Mettre à jour le profil de l'utilisateur
 // Mettre à jour le profil de l'utilisateur
 exports.updateProfile = async (req, res) => {
    const { firstName, lastName, address, phone, dateOfBirth, gender, institution, educationLevel, diploma, languages } = req.body;

    try {
        console.log('ID utilisateur:', req.user.id); // Log de l'ID utilisateur
        console.log('Données reçues:', req.body); // Log des données reçues pour la mise à jour

        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "Utilisateur non trouvé." });
        }

        // Mise à jour des informations de l'utilisateur
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.address = address || user.address;
        user.phone = phone || user.phone;
        user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth; // Conversion en date si fourni
        user.gender = gender || user.gender;
        user.institution = institution || user.institution;
        user.educationLevel = educationLevel || user.educationLevel;
        user.diploma = diploma || user.diploma;

        // Mise à jour des langues
        if (languages) {
            user.languages = { ...user.languages.toObject(), ...languages };
        }

        console.log('Utilisateur mis à jour:', user); // Log des informations utilisateur avant l'enregistrement

        await user.save();

        // Renvoyer l'utilisateur à jour dans la réponse
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            compte: user.compte,
            address: user.address,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            institution: user.institution,
            educationLevel: user.educationLevel,
            diploma: user.diploma,
            languages: user.languages,
            role: user.role,
            avatar: user.avatar || null,
        });
    } catch (err) {
        console.error('Erreur lors de la mise à jour du profil:', err.message);
        res.status(500).send("Erreur du serveur.");
    }
};


// Récupérer tous les utilisateurs avec pagination
// Récupérer tous les utilisateurs avec pagination
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
        const query = { role: "user" }; // Query to filter users with role 'user'

        // Count the total number of users with role 'user'
        const totalUsers = await User.countDocuments(query);

        // Fetch users with role 'user', apply pagination and exclude password
        const users = await User.find(query)
            .select('-password') // Exclude the password field
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Send the response with users, total users, and total pages
        res.json({
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erreur du serveur.");
    }
};

