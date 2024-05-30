const { getAllConsultations, getConsultationById, addConsultation, deleteConsultation, updateConsultation, getConsultationsByPatient, getConsultationsByDoctor } = require("../controllers/consultationsController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/consultations', authMiddleware, getAllConsultations);
router.get('/consultation/:id', authMiddleware, getConsultationById);
router.post('/add-consultation', authMiddleware, addConsultation);
router.get('/:patId/consultations', authMiddleware, getConsultationsByPatient);
router.get('/:docId/docconsultations', authMiddleware, getConsultationsByDoctor);
router.delete('/delete-consultation/:id', authMiddleware, deleteConsultation);
router.put('/update-consultation/:id', authMiddleware, updateConsultation);

module.exports = router;