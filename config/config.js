module.exports = {
    HOST: process.env.DB_HOST || 'localhost',
    DB: process.env.DB_NAME || 'cab_med',
    USER: process.env.USER_NAME || 'root',
    PORT: process.env.DB_PORT || 3306,
    PASSWORD: process.env.DB_PASS || '',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    SECRET: process.env.SECRET || 'SCretKey@Cab_Med2024',
}