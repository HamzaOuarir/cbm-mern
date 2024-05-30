module.exports = (sequelize, Sequelize) => {
    const RendezVous = sequelize.define('rendezVous', {
        id_med: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        id_pat: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        observ: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
    });
    // RendezVous.associate = (models) => {
    //     RendezVous.belongsTo(models.User, {
    //         foreignKey: 'id_med',
    //         as: 'doctor',
    //     });
    //     RendezVous.belongsTo(models.User, {
    //         foreignKey: 'id_pat',
    //         as: 'patient',
    //     });
    // };
    return RendezVous;
};