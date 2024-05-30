const { addMedicament, deleteMedicament, updateMedicament, getAllMedicaments, getMedicamentById, getMedicamentsByOrd } = require("../controllers/medicamentController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/medicaments', authMiddleware, getAllMedicaments);
router.get('/medicaments/:id', authMiddleware, getMedicamentById);
router.post('/add-medicament', authMiddleware, addMedicament);
router.delete('/delete-medicament/:id', authMiddleware, deleteMedicament);
router.put('/update-medicament/:id', authMiddleware, updateMedicament);
router.get('/ordonnence-medicaments/:id', authMiddleware, getMedicamentsByOrd);

module.exports = router;