module.exports = (sequelize, Sequelize) => {
    const Rate = sequelize.define('song_rate', {
        songId: {
            field: 'song_id',
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        userId: {
            field: 'user_id',
            type: Sequelize.INTEGER
        },
        songRate: {
            field: 'song_rate',
            type: Sequelize.INTEGER
        }
    }, {
        timestamps: false,
        tableName: 'song_rates'
    });

    return Rate;
};