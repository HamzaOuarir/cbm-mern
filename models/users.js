module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define('users', {
        username: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            }
        },
        CIN: {
            type: Sequelize.STRING,
            allowNull: true,

        },
        password: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        nom: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        prenom: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        role: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        phone: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
    });

    // User.associate = (models) => {
    //     User.hasMany(models.RendezVous, {
    //         foreignKey: 'id_med',
    //         as: 'appointments',
    //     });
    // };

    return User;
};