const Sequelize = require('sequelize');
const config = require('../config/config.js');

const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD, {
    port: config.PORT,
    host: config.HOST,
    operatorsAliases: false,
    dialect: config.dialect,
    pool: {
        max: config.pool.max,
        min: config.pool.min,
        acquire: config.pool.acquire,
        idle: config.pool.idle,
    }
}

)

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./users.js')(sequelize, Sequelize);
db.patient = require('./patients.js')(sequelize, Sequelize);
db.consultation = require('./consultations.js')(sequelize, Sequelize);
db.rendezVous = require('./rendezVous.js')(sequelize, Sequelize);
db.ordonnance = require('./ordonnances.js')(sequelize, Sequelize);
db.medicament = require('./medicaments.js')(sequelize, Sequelize);
db.paiment = require('./paiment.js')(sequelize, Sequelize);

module.exports = db;