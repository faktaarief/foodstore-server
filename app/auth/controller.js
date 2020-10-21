const User = require('../user/model');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');

const { getToken } = require('../utils/get-token');

const register = async (req, res, next) => {
    try {

        const payload = req.body;
        let user = new User(payload);

        await user.save();

        return res.json(user);

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

const localStrategy = async (email, password, done) => {

    try {

        let user =
            await User
                .findOne({ email })
                .select('-__v -createdAt -updatedAt -cart_items -token');

        if (!user) return done();

        if (bcrypt.compareSync(password, user.password)) {
            ({ password, ...userWithoutPassword } = user.toJSON());
            return done(null, userWithoutPassword);

        }

    } catch (err) {

        done(err, null);

    }

    done();

}

const login = async (req, res, next) => {

    passport.authenticate('local', async (err, user) => {

        if (err) return next(err);

        if (!user) return res.json({ error: 1, message: 'email or password incorrect' });

        // Membuat JSON Web Token
        // 'fakta123' Merupakan Secret Key, Bisa Diganti
        let signed = jwt.sign(user, config.secretKey);

        // Simpan Token ke User Terkait
        await User.findOneAndUpdate(
            { _id: user._id },
            { $push: { token: signed } },
            { new: true }
        );

        return res.json({
            message: 'logged in successfully',
            user: user,
            token: signed
        });

    })(req, res, next);

}

const me = (req, res, next) => {

    if (!req.user) {
        return res.json({
            error: 1,
            message: `Your'e  not login or token expired`
        });
    }

    return res.json(req.user);

}

const logout = async (req, res, next) => {

    // Dapatkan Token Dari Request
    let token = getToken(req);

    // Hapus Token dari User
    let user = await User.findOneAndUpdate(
        { token: { $in: [token] } },
        { $pull: { token } },
        { useFindAndModify: false }
    )

    if (!user || !token) {
        return res.json({
            error: 1,
            message: 'No user found'
        });
    }

    return res.json({
        error: 0,
        message: 'Logout Berhasil'
    });

}

module.exports = {
    register,
    localStrategy,
    login,
    me,
    logout
}