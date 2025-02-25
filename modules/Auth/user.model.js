const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    matricule: {
        type: String,
        required: true
    },
    cin: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    compte: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
  
    role: {
        type: String,
        enum: ['owner', 'admin', 'user'],
        default: 'user'
    },
  
});

module.exports = mongoose.model('User', userSchema);
