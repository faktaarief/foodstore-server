// Import Package Mongoose
const mongoose = require('mongoose');

// Import Konfigurasi Terkait MongoDB dari 'app/config.js'
const { dbHost, dbName, dbPort, dbUser, dbPass } = require('../app/config');

// Connect ke MongoDB Menggunakan Konfigurasi Yang Telah Kita Import
mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }
);

// Simpan Koneksi Dalam Constant 'db'
const db = mongoose.connection;

// Export 'db' Supaya Bisa Digunakan Oleh File Lain Yang Membutuhkan
module.exports = db;
