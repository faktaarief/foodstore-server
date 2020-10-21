const Category = require('./model');
const { policyFor } = require('../policy');

const store = async (req, res, next) => {

    try {

        let payload = req.body;
        let category = new Category(payload);
        await category.save();
        let policy = policyFor(req.user);

        if (!policy.can('create', 'Category')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk membuat kategori'
            });
        }

        return res.json(category);

    } catch (err) {

        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);

    }

}

const index = async (req, res, next) => {

    try {

        let categories = await Category.find();

        return res.json(categories);

    } catch (err) {

        next(err);

    }

}

const update = async (req, res, next) => {

    try {

        let payload = req.body;
        let policy = policyFor(req.user);

        if (!policy.can('update', 'Category')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk mengupdate kategori'
            });
        }


        let category = await Category.findOneAndUpdate(
            { _id: req.params.id },
            payload,
            { new: true, runValidators: true }
        );

        return res.json(category);

    } catch (err) {

        if (err && err.name === 'ValidationError') {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        next(err);
    }

}

const destroy = async (req, res, next) => {

    try {

        let policy = policyFor(req.user);

        if (!policy.can('delete', 'Category')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk menghapus kategori'
            });
        }

        let deleted = await Category.findOneAndDelete({ _id: req.params.id });

        return res.json(deleted);

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