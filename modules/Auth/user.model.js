const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
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
