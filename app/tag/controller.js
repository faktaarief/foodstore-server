const Tag = require('./model');
const { policyFor } = require('../policy');

const store = async (req, res, next) => {

    try {

        let payload = req.body;
        let policy = policyFor(req.user);

        if (!policy.can('create', 'Tag')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk membuat tag'
            });
        }


        let tag = new Tag(payload);
        await tag.save();

        return res.json(tag);

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

        let tags = await Tag.find();

        return res.json(tags);

    } catch (err) {

        next(err);

    }

}

const update = async (req, res, next) => {

    try {

        let payload = req.body;
        let policy = policyFor(req.user);

        if (!policy.can('update', 'Tag')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk mengupdate tag'
            });
        }

        let tag = await Tag.findOneAndUpdate(
            { _id: req.params.id },
            payload,
            { new: true, runValidators: true }
        );

        return res.json(tag);

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

        if (!policy.can('delete', 'Tag')) {
            return res.json({
                error: 1,
                message: 'Anda tidak memilki akses untuk menghapus tag'
            });
        }

        let deleted = await Tag.findOneAndDelete({ _id: req.params.id });

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