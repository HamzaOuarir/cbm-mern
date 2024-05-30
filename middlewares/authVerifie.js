const jwt = require('jsonwebtoken');
const config = require('../config/config.js');

verifyToken = (req, res, next) => {
    let token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send({
            message: 'No token provided!',
        });
    }
    token = token.replace('Bearer ', '');

    jwt.verify(token, config.SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            console.error('Token verification error:', err);
            return res.status(401).send({
                message: 'Unauthorized!',
            });
        }

        req.userId = decoded.id;
        next();
    });
};