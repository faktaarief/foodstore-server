// Import Model 'Product'
const Product = require('./model');
const Category = require('../categories/model');
const Tag = require('../tag/model');

// Import Config
const config = require('../config');
const { policyFor } = require('../policy');

const fs = require('fs');
const path = require('path');

const store = async (req, res, next) => {

    try {

        let payload = req.body;
        let policy = policyFor(req.user);

        if (!policy.can('create', 'Product')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk membuat produk'
            });
        }

        if (payload.category) {

            let category =
                await Category
                    .findOne({
                        name: { $regex: payload.category, $options: 'i' }
                    });

            if (category) {

                payload = {
                    ...payload,
                    category: category._id
                };

            } else {

                delete payload.category;

            }

        }

        if (payload.tags && payload.tags.length) {

            let tags =
                await Tag
                    .find({
                        name: { $in: payload.tags }
                    });

            if (tags.length) {

                payload = {
                    ...payload,
                    tags: tags.map(tag => tag._id)
                }
            }

        }

        if (req.file) {

            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`);

            // Baca File yang Masih di Lokasi Sementara
            const src = fs.createReadStream(tmp_path);

            // Pindahkan File ke Lokasi Permanen
            const dest = fs.createWriteStream(target_path);

            // Mulai Pindahkan File dari 'src' ke 'dest'
            src.pipe(dest);

            src.on('end', async () => {

                let product = new Product({
                    ...payload,
                    image_url: filename
                });

                await product.save();
                return res.json(product);

            });

            src.on('error', async () => {

                next(err);

            });

        } else {

            // Buat Product Baru Menggunakan Data Dari 'payload'
            let product = new Product(payload);

            // Simpan Product Yang Baru Dibuat ke MongoDB
            await product.save();

            // Berikan Respon Kepada Client Dengan Mengembalikan Product Yang Baru Dibuat
            return res.json(product);

        }

    } catch (err) {


        // Cek Tipe Error
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        // Tangkap Jika Terjadi Kesalahan Kemudian Gunakan Method 'next' Agar Express Memproses Error Tsb
        next(err);

    }

}

const index = async (req, res, next) => {

    try {

        let {
            limit = 10,
            skip = 0,
            q = '',
            category = '',
            tags = []
        } = req.query;

        let criteria = {};

        // Mencari Berdasarkan Kueri
        if (q.length) {
            criteria = {
                ...criteria,
                name: { $regex: `${q}`, $options: 'i' }
            }
        }

        // Mencari Berdasarkan Kategori
        if (category.length) {
            category = await Category.findOne({
                name: { $regex: `${category}`, $options: 'i' }
            });

            if (category) {
                criteria = {
                    ...criteria,
                    category: category._id
                }
            }
        }

        // Mencari Berdasarkan Tags
        if (tags.length) {
            tags = await Tag.find({ name: { $in: tags } });
            criteria = {
                ...criteria,
                tags: { $in: tags.map(tag => tag._id) }
            }
        }

        // Tampil Semua
        // let products = await Product.find();

        let count = await Product.find(criteria).countDocuments();

        // Pagination
        let products =
            await Product
                .find(criteria)
                .populate('category')
                .populate('tags')
                .limit(parseInt(limit))
                .skip(parseInt(skip));

        return res.json({ data: products, count });

    } catch (err) {

        next(err);

    }

}

const update = async (req, res, next) => {

    try {

        let payload = req.body;
        let policy = policyFor(req.user);

        if (!policy.can('update', 'Product')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk mengupdate produk'
            });
        }

        if (payload.category) {

            let category =
                await Category
                    .findOne({
                        name: { $regex: payload.category, $options: 'i' }
                    });

            if (category) {

                payload = {
                    ...payload,
                    category: category._id
                };

            } else {

                delete payload.category;

            }

        }

        if (payload.tags && payload.tags.length) {

            let tags =
                await Tag
                    .find({
                        name: { $in: payload.tags }
                    });

            if (tags.length) {

                payload = {
                    ...payload,
                    tags: tags.map(tag => tag._id)
                }
            }

        }

        if (req.file) {

            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/upload/${filename}`);

            // Baca File yang Masih di Lokasi Sementara
            const src = fs.createReadStream(tmp_path);

            // Pindahkan File ke Lokasi Permanen
            const dest = fs.createWriteStream(target_path);

            // Mulai Pindahkan File dari 'src' ke 'dest'
            src.pipe(dest);

            src.on('end', async () => {

                let product = await Product.findOne({ _id: req.params.id });
                let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;

                if (fs.existsSync(currentImage)) {

                    fs.unlinkSync(currentImage);

                }

                product = await Product.findOneAndUpdate(
                    { _id: req.params.id },
                    { ...payload, image_url: filename },
                    { new: true, runValidators: true }
                );

                return res.json(product);

            });

            src.on('error', async () => {

                next(err);

            });

        } else {

            // Update Product Berdasarkan ID 
            let product = await Product
                .findOneAndUpdate(
                    { _id: req.params.id },
                    payload,
                    { new: true, runValidators: true }
                );

            // Berikan Respon Kepada Client Dengan Mengembalikan Product Yang Baru Diupdate
            return res.json(product);

        }

    } catch (err) {


        // Cek Tipe Error
        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            })
        }

        // Tangkap Jika Terjadi Kesalahan Kemudian Gunakan Method 'next' Agar Express Memproses Error Tsb
        next(err);

    }

}

const destroy = async (req, res, next) => {

    try {

        let product = await Product.findOneAndDelete({ _id: req.params.id });
        let currentImage = `${config.rootPath}/public/upload/${product.image_url}`;
        let policy = policyFor(req.user);

        if (!policy.can('delete', 'Product')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk menghapus produk'
            });
        }

        if (fs.existsSync(currentImage)) {

            fs.unlinkSync(currentImage);

        }

        return res.json(product);

    } catch (err) {

        next(err);

    }

}

module.exports = {
    store,
    index,
    update,
    destroy
}