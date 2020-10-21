// Import AbililtyBuilder dan Ability
const { AbilityBuilder, Ability } = require('@casl/ability');

// Buat Object Policy
const policies = {

    guest(user, { can }) {
        can('read', 'Product');
    },

    user(user, { can }) {

        // Membaca Daftar `order`
        can('view', 'Order');

        // Membuat Order
        can('create', 'Order');

        // Membaca Order Miliknya
        can('read', 'Order', { user_id: user._id });

        // Mengupdate Data Dirinya Sendiri (User)
        can('update', 'User', { _id: user._id });

        // Membaca Cart Miliknya
        can('read', 'Cart', { user_id: user._id });

        // Mengupdate Cart Miliknya
        can('update', 'Cart', { user_id: user.id });

        // Melihat Daftar DeliveryAddress
        can('view', 'DeliveryAddress');

        // Membuat DeliveryAddress
        can('create', 'DeliveryAddress', { user_id: user._id });

        // Membaca DeliveryAddress miliknya
        can('read', 'DeliveryAddress', { user_id: user._id });

        // Mengupdate DeliveryAddress Miliknya
        can('update', 'DeliveryAddress', { user_id: user._id });

        // Menghapus DeliveryAddress Miliknya
        can('delete', 'DeliveryAddress', { user_id: user._id });

        // Membaca Invoice Miliknya
        can('read', 'Invoice', { user_id: user._id });

    },

    admin(user, { can }) {
        can('manage', 'all');
    }

}

const policyFor = (user) => {

    let builder = new AbilityBuilder();

    if (user && typeof policies[user.role] === 'function') {
        policies[user.role](user, builder);
    } else {
        policies['guest'](user, builder);
    }

    return new Ability(builder.rules);

}

module.exports = {
    policyFor
}