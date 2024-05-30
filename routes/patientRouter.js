const { addPatient, deletePatient, updatePatient, getAllPatients, getPatientById, uploadFileToPatient, getPatientFiles, deleteFile, downloadFile, getFileContent, getPatientPhoto } = require("../controllers/patientsController");
const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");

const upload = require("../middlewares/upload");
const router = express.Router();

router.get('/patients', authMiddleware, getAllPatients);
router.get('/patient/:id', authMiddleware, getPatientById);
router.post('/add-patient', authMiddleware, upload.array('files'), addPatient);
router.delete('/delete-patient/:id/:isChecked', authMiddleware, deletePatient);
router.put('/update-patient/:id', authMiddleware, upload.array('files'), updatePatient);

router.post('/patient/:patientId/upload', authMiddleware, upload.array('files'), uploadFileToPatient);
router.get('/patient/:patientId/files', authMiddleware, getPatientFiles);
router.get('/patient/:patientId/files/:fileName', authMiddleware, getFileContent);
router.get('/patient/:patientId/photo', authMiddleware, getPatientPhoto);
router.get('/patient/:patientId/download/:fileName', authMiddleware, downloadFile);
router.delete('/patient/:patientId/delete/:fileName', authMiddleware, deleteFile);

module.exports = router;