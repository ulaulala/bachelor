const express = require('express');
const app = express();
const path = require('path');
const Sequelize = require('sequelize');

const RecommendationsService = require('./recommendationsService');
const SequelizeService = require('./SequelizeService');

const UserModel = require('./models/user');
const SongModel = require('./models/song');
const RateModel = require('./models/rate');

app.use('/static', express.static(path.join(__dirname, '/public')));

const sequelize = SequelizeService.dbConnect();

app.listen(3000, () => {
    console.log("Server is listening! PORT: 3000");
    SequelizeService.dbAuthentication(sequelize);
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
});
app.get('/sign-in', (request, response) => {
    response.sendFile(__dirname + '/views/sign-in.html');
});

app.get('/rates', (request, response) => {
    RateModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})
        .then(rates => {
        response.send(rates);
    })
        .catch(err => console.log(err));
});

app.get('/rates/user/:id', (request, response) => {
    RateModel(sequelize, Sequelize).findAll({
        raw: true, mapToModel: true,
        where: { userId: request.params.id }})
        .then(rates => {
        response.send(rates);
    })
        .catch(err => console.log(err));

});

app.get('/rates/user/:userId/song/:songId', (request, response) => {
    RateModel(sequelize, Sequelize).findAll({
        raw: true, mapToModel: true,
        where: {
            userId: request.params.userId,
            songId: request.params.songId
        }})
        .then(rates => {
            response.send(rates);
        })
        .catch(err => console.log(err));
});

app.get('/songs', (request, response) => {
    SongModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})
        .then(songs => response.send(songs))
        .catch(err => console.log(err));
});

app.get('/songs/:id', (request, response) => {
    SongModel(sequelize, Sequelize).findOne({
        raw: true, mapToModel: true,
        where: {id: request.params.id}
    })
        .then(songs => response.send(songs))
        .catch(err => console.log(err));
});

app.get('/users/:id', (request, response) => {
    UserModel(sequelize, Sequelize).findOne({
        raw: true, mapToModel: true,
        where: {id: request.params.id}
    })
        .then(user => response.send(user))
        .catch(err => console.log(err));
});
app.get('/users/username/:username', (request, response) => {
    UserModel(sequelize, Sequelize).findOne({
        raw: true, mapToModel: true,
        where: {name: request.params.username}
    })
        .then(user => response.send(user))
        .catch(err => console.log(err));
});
app.post('/users/new/:username', (request, response) => {
    UserModel(sequelize, Sequelize)
        .findOne({
            where: {
                name: request.params.username
            }})
        .then(element => {
                if(element) {
                    throw Error('User already exists')
                }
                else {
                    // console.log(request.body, response.body)
                    UserModel(sequelize, Sequelize).create({
                            name: request.params.name,
                            password: request.body.password
                        })
                        .then(newUser => response.send(newUser))
                        .catch(err => console.log(err));
                }
            }
        )
});

app.get('/users', (request, response) => {
    UserModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})
        .then(users => response.send(users));
})

app.get('/recommendations/svd/user/:id', (request, response) => {
    Promise.all([
        UserModel(sequelize, Sequelize).count(),
        SongModel(sequelize, Sequelize).count(),
        RateModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})

    ])
        .then(results => {
            let matrix = RecommendationsService.makeMatrixFromRatings(results[2], results[0], results[1]);
            response.send(RecommendationsService.recommendBySVD(matrix, request.params.id));
        })
        .catch(err => console.log(err));

});
app.get('/recommendations/reduced-svd/user/:id', (request, response) => {
    Promise.all([
        UserModel(sequelize, Sequelize).count(),
        SongModel(sequelize, Sequelize).count(),
        RateModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})

    ])
        .then(results => {
            let matrix = RecommendationsService.makeMatrixFromRatings(results[2], results[0], results[1]);
            response.send(RecommendationsService.recommendByReducedSVD(matrix, request.params.id));
        })
        .catch(err => console.log(err));
});

app.get('/recommendations/similarity/user/:id', (request, response) => {
    Promise.all([
        UserModel(sequelize, Sequelize).count(),
        SongModel(sequelize, Sequelize).count(),
        RateModel(sequelize, Sequelize).findAll({raw: true, mapToModel: true})

    ])
        .then(results => {
            let matrix = RecommendationsService.makeMatrixFromRatings(results[2], results[0], results[1]);
            response.send(RecommendationsService.recommendBySimilarity(matrix, request.params.id));
        })
        .catch(err => console.log(err));
});

app.get('/recommendations/top/:number', (request, response) => {
    RateModel(sequelize, Sequelize).findAll({
        raw: true, mapToModel: true,
        order: [['song_rate', 'DESC']]
    })
        .then(rates => {
            let ranking = new Map()
            rates.map(rate => {
                ranking.set(rate.songId, {sumOfRates: 0, numberOfRates: 0})
            })
            rates.map(rate => {
                let current = {...ranking.get(rate.songId)}
                ranking.set(rate.songId, {
                    sumOfRates: current.sumOfRates + rate.songRate,
                    numberOfRates: ++current.numberOfRates
                })
            })

            let result = []
            ranking.forEach((value, key) => {
                result.push({ id: key, average: value.sumOfRates / value.numberOfRates })
            })
            result.sort(function (a, b) {
                return b.average - a.average;
            });

            console.log(result)
            result = result.map(element => element.id)

            SongModel(sequelize, Sequelize).findAll({
                raw: true, mapToModel: true,
                where: {id: result},
                order: sequelize.literal("FIELD(song_id,"+result.join(',')+")"),
                limit: parseInt(request.params.number)
            })
                .then(songs => {
                response.send(songs);
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

app.put('/rate/:songRate/user/:userId/song/:songId', (request, response) => {
    RateModel(sequelize, Sequelize)
        .findOne({
            where: {
                userId: request.params.userId,
                songId: request.params.songId
            }})
        .then(element => {
            if(element) { // update
                RateModel(sequelize, Sequelize).update(
                    {songRate: request.params.songRate},
                    {
                        raw: true, mapToModel: true,
                        where: {
                            userId: request.params.userId,
                            songId: request.params.songId
                        }
                    })
                    .then(newRate => response.send(newRate))
                    .catch(err => console.log(err));
            }
            else { // insert
                RateModel(sequelize, Sequelize).create(
                    {
                        songRate: request.params.songRate,
                        userId: request.params.userId,
                        songId: request.params.songId
                    })
                    .then(newRate => response.send(newRate))
                    .catch(err => console.log(err));
            }
        }
        )
});

app.delete('/delete-rate/user/:userId/song/:songId', (request, response) => {
    RateModel(sequelize, Sequelize).destroy({
        where: {
            userId: request.params.userId,
            songId: request.params.songId
        }
    })
        .then(responseMessage => response.send(responseMessage))
        .catch(err => console.log(err));
});


module.exports = app;