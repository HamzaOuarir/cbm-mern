const { addOrdonnance, deleteOrdonnance, updateOrdonnance, getAllOrdonnances, getOrdonnanceById } = require("../controllers/ordonnanceController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/ordonnances', authMiddleware, getAllOrdonnances);
router.get('/ordonnances/:id', authMiddleware, getOrdonnanceById);
router.post('/add-ordonnance', authMiddleware, addOrdonnance);
router.delete('/delete-ordonnance/:id', authMiddleware, deleteOrdonnance);
router.put('/update-ordonnance/:id', authMiddleware, updateOrdonnance);

module.exports = router;