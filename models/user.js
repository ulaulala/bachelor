module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        id: {
            field: 'user_id',
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        name: {
            field: 'user_name',
            type: Sequelize.STRING
        },
        password: {
            field: 'user_password',
            type: Sequelize.STRING
        }
    }, {
        timestamps: false,
        tableName: 'users'
    });

    return User;
};