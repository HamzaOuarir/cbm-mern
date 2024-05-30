module.exports = (sequelize, Sequelize) => {
    const Mecicament = sequelize.define('mecicaments', {
        name: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        id_ord: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    });
    return Mecicament;
}