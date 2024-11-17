const mongoose = require('mongoose');

const chaperSchema = new mongoose.Schema({
    chaperId: {
        type: String,
        required: true,
        unique: true,
    },
    chaperName: {
        type: String,
        required: true,
        unique: true,
    },
    link: {
        type: String,
        required: true,
        unique: true,
    },
    Content: {
        type: String,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Chaper', chaperSchema);