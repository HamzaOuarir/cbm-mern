module.exports = (sequelize, Sequelize) => {
    const Ordonnance = sequelize.define('ordonnances', {
        id_cons: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    });
    return Ordonnance;
}