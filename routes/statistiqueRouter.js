const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { todayPatient, getPatientsThisMonth, getPatientsThisYear, todayConsultations, todayPaymentsTotal, getTotalPaymentsByYear, getPaimentsTotalByDay, getTodayPaimentsWithPatientInfo, getConsultationsThisMonth, getConsultationsThisYear, getConsultationsThisWeek, getPatientsWithRendezVousByMonth, getPatientsByMonth, getPatientsByYear, getDistinctYearsWithPatients, todayRendezvous, getPatientsMoreThan2ConsByYear, getPaymentsByYear, getConsultationStatusByYear, getConsultationsByYear, statistics, getConsultationsByMonth, getRendezvousByMonth, getRendezvousByYear } = require("../controllers/statistiqueController");
const router = express.Router();
router.get("/today-patients", todayPatient)
router.get("/month-patients", getPatientsThisMonth)
router.get("/year-patients", getPatientsThisYear)
router.get("/today-consultations", todayConsultations)
router.get("/today-amount", todayPaymentsTotal)
router.get("/today-rdv", todayRendezvous)
router.get("/week-amount", getPaimentsTotalByDay)
router.get("/today-paiments", getTodayPaimentsWithPatientInfo)


router.get("/week-consultations", getConsultationsThisWeek)
router.get("/year-consultations", getConsultationsThisYear)
router.get("/month-consultations", getConsultationsThisMonth)


router.get("/month-patients/:year/:month", getPatientsByMonth)
router.get("/year-patients/:year", getPatientsByYear)

router.get("/year-top-cons-patients/:year", getPatientsMoreThan2ConsByYear)



router.get("/year-paiments/:year", getPaymentsByYear)


router.get("/year-total-paiments/:year", getTotalPaymentsByYear)


router.get("/patients-rdvstats", getPatientsWithRendezVousByMonth)
router.get("/years", getDistinctYearsWithPatients)
router.get("/all-stats", statistics)




router.get("/consultations-status", getConsultationStatusByYear)
router.get("/year-consultations/:year", getConsultationsByYear)



router.get("/month-consultations/:year/:month", getConsultationsByMonth)
router.get("/month-rendezVous/:year/:month", getRendezvousByMonth)
router.get("/year-rendezVous/:year", getRendezvousByYear)


module.exports = router;