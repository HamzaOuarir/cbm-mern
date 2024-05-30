const config = require('../config/config.js');
const jwt = require('jsonwebtoken');
const db = require('../models/index.js');

const adminMiddleware = async (req, res, next) => {
    let token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({
            message: 'No token provided!',
        });
    }

    token = token.replace('Bearer ', '');

    jwt.verify(token, config.SECRET, async (err, decoded) => {
        if (err) {
            console.error('Token verification error:', err);
            return res.status(401).send({
                message: 'Unauthorized!',
            });
        }

        req.userId = decoded.id;

        try {
            const user = await db.user.findByPk(req.userId);
            if (!user) {
                return res.status(404).send({
                    message: 'User not found!',
                });
            }

            if (user.role !== 'Admin') {
                return res.status(403).send({
                    message: 'Require Admin Role!',
                });
            }

            next();
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).send({
                message: 'Server error',
            });
        }
    });
};

module.exports = adminMiddleware;