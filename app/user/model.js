const mongoose = require('mongoose');
const { model, Schema } = mongoose;
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const HASH_ROUND = 10;

// Validasi User Data
let userSchema = Schema({

    full_name: {
        type: String,
        required: [true, 'Nama Harus Diisi'],
        maxlength: [255, 'Panjang Nama Harus Antara 3 - 255 Karakter'],
        minlength: [3, 'Panjang Nama Harus Antara 3 - 255 Karakter']
    },

    customer_id: {
        type: Number
    },

    email: {
        type: String,
        required: [true, 'Email Harus Diisi'],
        maxlength: [255, 'Panjang Email Maksimal 255 Karakter'],
    },

    password: {
        type: String,
        required: [true, 'Password Harus Diisi'],
        maxlength: [255, 'Panjang Password Maksimal 255 Karakter']
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    token: [String]

}, { timestamps: true });

// Validasi Penulisan Email
userSchema.path('email').validate(function (value) {

    const EMAIL_RE = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;

    return EMAIL_RE.test(value);

}, attr => `${attr.value} harus merupakan email yang valid!`);

// Cek Apakah Email Unik (Tidak Ada Email yang Sama)
userSchema.path('email').validate(async function (value) {

    try {

        // Lakukan Pencarian ke _collection_ User berdasarkan 'email'
        const count = await this.model('User').count({ email: value });

        // Kode ini mengindikasikan bahwa jika user ditemukan akan mengembalikan 'true'
        // Jika false Maka Validasi Gagal
        // Jika true Maka Validasi Berhasil
        return !count;

    } catch (err) {

        throw err;

    }

}, attr => `${attr.value} sudah terdaftar`);

userSchema.pre('save', function (next) {

    this.password = bcrypt.hashSync(this.password, HASH_ROUND);
    next();

});

userSchema.plugin(AutoIncrement, { inc_field: 'customer_id' });

module.exports = model('User', userSchema);