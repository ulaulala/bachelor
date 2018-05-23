module.exports = (sequelize, Sequelize) => {
    const Song = sequelize.define('songs', {
        id: {
            field: 'song_id',
            type: Sequelize.INTEGER,
            primaryKey: true
        },
        title: {
            field: 'song_title',
            type: Sequelize.STRING
        },
        author: {
            field: 'song_author',
            type: Sequelize.STRING
        },
        album: {
            field: 'album',
            type: Sequelize.STRING
        },
        category: {
            field: 'category',
            type: Sequelize.STRING
        },
        durationTime: {
            field: 'duration_time',
            type: Sequelize.STRING
        }
    }, {
        timestamps: false,
        tableName: 'songs'
    });

    return Song;
};