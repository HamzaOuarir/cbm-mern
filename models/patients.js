module.exports = (sequelize, Sequelize) => {
    const Patient = sequelize.define('patients', {
        FName: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        LName: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        CIN: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        dateNes: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        PHONE: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        ADDRESSE: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        GENDER: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
        PHOTO: {
            type: Sequelize.STRING(100),
            allowNull: true,
        },
    });
    return Patient;
}