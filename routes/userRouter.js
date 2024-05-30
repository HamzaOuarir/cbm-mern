const { addUser, deleteUser, resetPassword, modifyPassword, getDocFileContent, updateUser, getAllUsers, getUserById, Login, updatePassword, getUserByWithPatient, getDocphoto } = require("../controllers/userController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const upload = require("../middlewares/upload");
const adminMiddleware = require("../middlewares/adminMiddleware");
router.get('/users', authMiddleware, getAllUsers);
router.get('/user/:id', authMiddleware, getUserById);
router.get('/user/:id/patients', authMiddleware, getUserByWithPatient);
router.post('/add-user', adminMiddleware, upload.array('files'), addUser);
router.post('/login', Login);
router.delete('/delete-user/:id', adminMiddleware, deleteUser);
router.put('/update-user/:id', adminMiddleware, upload.array('files'), updateUser);
router.put('/update-user-password/:id', authMiddleware, updatePassword);

router.put('/reset-user-password/', resetPassword);
router.put('/modify-user-password/:id/:token', modifyPassword);

router.get('/user/:docId/files/:fileName', authMiddleware, getDocFileContent);
router.get('/user/:docId/photo', authMiddleware, getDocphoto);
module.exports = router;