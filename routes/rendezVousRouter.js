const { addRendezVous, deleteRendezVous, updateRendezVous, getAllRendezVous, getRendezVousById, getRendezVousByPatient, getRendezVousByDoctor } = require("../controllers/rendezVousController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/rendezvous', authMiddleware, getAllRendezVous);
router.get('/:patId/rendezvous', authMiddleware, getRendezVousByPatient);
router.get('/:docId/docrendezvous', authMiddleware, getRendezVousByDoctor);
router.get('/rendezvous/:id', authMiddleware, getRendezVousById);
router.post('/add-rendezvous', authMiddleware, addRendezVous);
router.delete('/delete-rendezvous/:id', authMiddleware, deleteRendezVous);
router.put('/update-rendezvous/:id', authMiddleware, updateRendezVous);

module.exports = router;