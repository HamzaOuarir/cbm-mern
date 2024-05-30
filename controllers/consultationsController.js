const db = require("../models/index");
const sequelize = require('sequelize');
const addConsultation = async (req, res) => {
    try {
        const {
            id_med,
            id_pat,

            type,
            diagnostique,
            priscription,
            // state,
            prix
        } = req.body;
        const newConsultation = await db.consultation.create({
            id_med,
            id_pat,
            date: new Date(),
            type,
            diagnostique,
            priscription,
            state: "encours",
            prix
        });
        res.status(201).json(newConsultation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const deleteConsultation = async (req, res) => {
    try {
        const consultationId = req.params.id;
        const deletedConsultation = await db.consultation.destroy({
            where: {
                id: consultationId,
            },
        });
        res.status(200).json({ message: 'Consultation deleted successfully', deletedConsultation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const updateConsultation = async (req, res) => {
    try {
        const consultationId = req.params.id;
        const {
            id_med,
            id_pat,
            type,
            diagnostique,
            priscription,
            state,
            prix
        } = req.body;
        const consultation = await db.consultation.findByPk(consultationId);
        const totalMontant = await db.paiment.findOne({
            attributes: [
                [sequelize.fn('SUM', db.sequelize.col('montant')), 'totalMontant']
            ],
            where: {
                id_cons: consultationId
            }
        });
        consultation.id_med = id_med;
        consultation.id_pat = id_pat;
        consultation.date = new Date();
        consultation.type = type;
        consultation.diagnostique = diagnostique;
        consultation.priscription = priscription;
        consultation.prix = prix;
        if (totalMontant.dataValues.totalMontant > prix) {
            res.status(200).json({ message: 'Consultation updated successfully', consultation });

        } else if (totalMontant.dataValues.totalMontant == prix) {
            consultation.state = "payé";
            await consultation.save();

            res.status(200).json({ message: 'Consultation updated successfully', consultation });
        } else {
            consultation.state = "encours";
            await consultation.save();

            res.status(200).json({ message: 'Consultation updated successfully', consultation });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getAllConsultations = async (req, res) => {
    try {
        const consultations = await db.consultation.findAll();
        const patients = await db.patient.findAll();
        const doctors = await db.user.findAll();

        const mappedconsultations = consultations.map(c => {
            const patient = patients.find(p => p.id === c.id_pat);
            const doctor = doctors.find(d => d.id === c.id_med);

            return {
                ...c.toJSON(),
                patientName: patient ? patient.LName + " " + patient.FName : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown',
                doctorName: doctor ? doctor.nom + " " + doctor.prenom : 'Unknown'
            };
        });
        res.status(200).json(mappedconsultations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getConsultationById = async (req, res) => {
    try {
        const consultationId = req.params.id;
        const consultation = await db.consultation.findByPk(consultationId);
        if (!consultation) {
            return res.status(404).json({ message: 'Consultation not found' });
        }
        res.status(200).json(consultation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};
const getConsultationsByPatient = async (req, res) => {
    try {
        const patId = req.params.patId;
        const consultations = await db.consultation.findAll({
            where: {
                id_pat: patId
            }
        });


        if (!consultations || consultations.length === 0) {
            return res.status(200).json([]);
        }

        const doctors = await db.user.findAll();

        const consultationsWithDoctors = consultations.map(consultation => {
            const doctor = doctors.find(d => d.id === consultation.id_med);
            return {
                ...consultation.toJSON(),
                doctorName: doctor ? `${doctor.nom} ${doctor.prenom}` : 'Unknown',
                doctorPhone: doctor ? doctor.PHONE : 'Unknown',
            };
        });

        res.status(200).json(consultationsWithDoctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



const getConsultationsByDoctor = async (req, res) => {
    try {
        const docId = req.params.docId;

        const consultations = await db.consultation.findAll({
            where: {
                id_med: docId
            }
        });

        if (!consultations || consultations.length === 0) {
            return res.status(200).json([]);
        }

        const patients = await db.patient.findAll();

        const consultationsWithPatient = consultations.map(consultation => {
            const patient = patients.find(p => p.id === consultation.id_pat);
            return {
                ...consultation.toJSON(),
                patientName: patient ? `${patient.LName} ${patient.FName}` : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown',
            };
        });
        console.log(consultationsWithPatient);
        res.status(200).json(consultationsWithPatient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};





module.exports = { getConsultationsByDoctor, getConsultationsByPatient, addConsultation, deleteConsultation, updateConsultation, getAllConsultations, getConsultationById };