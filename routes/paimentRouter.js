const {
    addPaiment,
    deletePaiment,
    updatePaiment,
    getAllPaiments,
    getPaimentById,
    getPaimentsWithPatientInfo,
    getAllPaimentsWithPatientInfo
} = require("../controllers/paimentController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/paiments', authMiddleware, getAllPaiments);
router.get('/paiment/:id', authMiddleware, getPaimentById);
router.post('/add-paiment', authMiddleware, addPaiment);
router.get('/:idpat/paiments', authMiddleware, getPaimentsWithPatientInfo);
router.get('/paiments-patient-info', authMiddleware, getAllPaimentsWithPatientInfo);
router.delete('/delete-paiment/:id', authMiddleware, deletePaiment);
router.put('/update-paiment/:id', authMiddleware, updatePaiment);

module.exports = router;