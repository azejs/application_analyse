const roles = {
    user: [
        'api.get.profile',
        'api.update.profile',
        'api.get.niveaux', // Permettre aux utilisateurs de voir les niveaux
        'api.get.niveau', // Permettre aux utilisateurs de voir les détails d'un niveau
        'api.create.demande',
        'api.get.my.demandes',
        'api.update.my.demande',
        'api.delete.my.demande',
        'api.get.allniveaux.candidats',
    ],
    admin: [],
    owner: []
};

// Héritage des permissions
roles.admin = [
    ...roles.user,  // Hérite des permissions 'user'
    'api.get.nonpaye',
   'api.get.parcandidats',
    'api.get.candidats',
    'api.create.user',
    'api.delete.user',
    'api.get.users',
    'api.create.niveau', // Permettre aux administrateurs de créer des niveaux
    'api.update.niveau', // Permettre aux administrateurs de mettre à jour des niveaux
    'api.delete.niveau', // Permettre aux administrateurs de supprimer des niveaux
   
];

roles.owner = [
    ...roles.admin, 
    'api.manage.admins',
    'api.get.all.niveaux', 
    // Permettre aux propriétaires d'accéder à toutes les opérations liées aux niveaux
    'api.get.all.demandes',
    'api.update.any.demande',
    'api.delete.any.demande'
];

// Vérification des accès
const checkAccess = (role, action) => {
    return roles[role] && roles[role].includes(action);
};

module.exports = { checkAccess };
