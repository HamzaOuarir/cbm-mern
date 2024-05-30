module.exports = (sequelize, Sequelize) => {
    const Paiment = sequelize.define('paiments', {
        montant: {
            type: Sequelize.DOUBLE,
            allowNull: true,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: true,
        },
        id_pat: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        id_cons: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    });
    return Paiment;
}