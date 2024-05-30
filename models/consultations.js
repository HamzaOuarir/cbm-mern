module.exports = (sequelize, Sequelize) => {
    const Consultation = sequelize.define('consultation', {
        id_med: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        id_pat: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },

        type: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        diagnostique: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        priscription: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        state: {
            type: Sequelize.STRING,
            allowNull: true,
        },

        prix: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },



        date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    });
    return Consultation;
}