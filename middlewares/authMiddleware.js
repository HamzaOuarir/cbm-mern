const config = require('../config/config.js');
const jwt = require('jsonwebtoken');

const authMiddleware = async(req, res, next) => {
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
    // const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    // if (!token) {
    //     return res.status(401).json({ error: 'Unauthorized: No token provided' });
    // }

    // try {
    //     const decoded = jwt.verify(token, config.SECRET);
    //     req.user = decoded;
    //     next();
    // } catch (error) {
    //     return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    // }
};

module.exports = authMiddleware;