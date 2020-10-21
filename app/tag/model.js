const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const tagSchema = Schema({

    name: {
        type: String,
        minlength: [3, 'Panjang Nama Tag Minimal 3 Karakter'],
        maxlength: [20, 'Panjang Nama Tag Maksimal 3 Karakter'],
        required: [true, 'Nama Tag Harus Diisi']
    }

}, { timestamps: true });

module.exports = model('Tag', tagSchema);