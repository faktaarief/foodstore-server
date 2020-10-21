const DeliveryAddress = require('./model');
const { policyFor } = require('../policy');
const { subject } = require('@casl/ability');

const store = async (req, res, next) => {

    let policy = policyFor(req.user);

    if (!policy.can('create', 'DeliveryAddress')) {
        return res.json({
            error: 1,
            message: 'Your not allowed to perform this action'
        });
    }

    try {

        let payload = req.body;
        let user = req.user;

        // Buat Instance DeliveryAddress Berdasarkan Payload dan Data User
        let address = new DeliveryAddress({ ...payload, user: user._id });

        await address.save();

        return res.json(address);

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

const update = async (req, res, next) => {

    let policy = policyFor(req.user);

    try {

        // Dapatkan 'id' dari 'req.params'
        let { id } = req.query;

        // Buat Payload dan Keluarkan _id
        let { _id, ...payload } = req.body;

        let address = await DeliveryAddress.findOne({ _id: id });

        let subjectAddress = subject('DeliveryAddress', {
            ...address,
            user_id: address.user
        });

        if (!policy.can('update', subjectAddress)) {
            return res.json({
                error: 1,
                message: 'Your not allowed to modify this resource'
            });
        }

        address = await DeliveryAddress.findOneAndUpdate({ _id: id }, payload, { new: true });

        return res.json(address);

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

    let policy = policyFor(req.user);

    try {

        let { id } = req.query;

        // Cari Address Yang Mau Dihapus 
        let address = await DeliveryAddress.findOne({ _id: id });

        // Buat Subject Address
        let subjectAddress = subject('DeliveryAddress', {
            ...address,
            user_id: address.user
        });

        if (!policy.can('delete', subjectAddress)) {
            return res.json({
                error: 1,
                message: 'Your not allowed to delete this resource'
            });
        }

        address = await DeliveryAddress.findOneAndDelete({ _id: id });

        return res.json(address);

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

    const policy = policyFor(req.user);

    if (!policy.can('view', 'DeliveryAddress')) {
        return res.json({
            error: 1,
            message: 'Your not allowed to perform this action'
        });
    }

    try {

        let { limit = 10, skip = 0 } = req.query;

        const count = await DeliveryAddress.find({
            user: req.user._id
        }).countDocuments();

        const deliveryAddress =
            await DeliveryAddress
                .find({ user: req.user._id })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .sort('-createdAt')

        return res.json({ data: deliveryAddress, count: count });

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

module.exports = {
    store,
    update,
    destroy,
    index
}