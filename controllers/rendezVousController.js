const db = require("../models/index");

const addRendezVous = async (req, res) => {
    try {
        const { id_med, id_pat, observ, date } = req.body;

        const newRendezVous = await db.rendezVous.create({
            id_med,
            id_pat,
            observ,
            date,
        });
        res.status(201).json(newRendezVous);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const deleteRendezVous = async (req, res) => {
    try {
        const rendezVousId = req.params.id;
        const deletedRendezVous = await db.rendezVous.destroy({
            where: {
                id: rendezVousId,
            },
        });
        res.status(200).json({ message: 'RendezVous deleted successfully', deletedRendezVous });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const updateRendezVous = async (req, res) => {
    try {
        const rendezVousId = req.params.id;
        const { id_med, id_pat, observ, date } = req.body;
        const rendezVous = await db.rendezVous.findByPk(rendezVousId);
        rendezVous.id_med = id_med;
        rendezVous.id_pat = id_pat;
        rendezVous.date = date;
        rendezVous.observ = observ;

        await rendezVous.save();

        res.status(200).json({ message: 'RendezVous updated successfully', rendezVous });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getAllRendezVous = async (req, res) => {
    try {
        const rendezVous = await db.rendezVous.findAll();
        const patients = await db.patient.findAll();
        const doctors = await db.user.findAll();

        const mappedRendezVous = rendezVous.map(r => {
            const patient = patients.find(p => p.id === r.id_pat);
            const doctor = doctors.find(d => d.id === r.id_med);

            return {
                ...r.toJSON(),
                patientName: patient ? patient.LName + " " + patient.FName : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown',
                doctorName: doctor ? doctor.nom + " " + doctor.prenom : 'Unknown'
            };
        });

        res.status(200).json(mappedRendezVous);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};


const getRendezVousById = async (req, res) => {
    try {
        const rendezVousId = req.params.id;
        const rendezVous = await db.rendezVous.findByPk(rendezVousId);
        if (!rendezVous) {
            return res.status(404).json({ message: 'RendezVous not found' });
        }
        res.status(200).json(rendezVous);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};
const getRendezVousByPatient = async (req, res) => {
    const patId = req.params.patId;
    try {
        const rendezVous = await db.rendezVous.findAll({
            where: {
                id_pat: patId
            }
        });
        const patients = await db.patient.findAll();
        const doctors = await db.user.findAll();

        const mappedRendezVous = rendezVous.map(r => {
            const patient = patients.find(p => p.id === r.id_pat);
            const doctor = doctors.find(d => d.id === r.id_med);

            return {
                ...r.toJSON(),
                patientName: patient ? patient.LName + " " + patient.FName : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown',
                doctorName: doctor ? doctor.nom + " " + doctor.prenom : 'Unknown'
            };
        });

        res.status(200).json(mappedRendezVous);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};


const getRendezVousByDoctor = async (req, res) => {
    const docId = req.params.docId;
    try {
        const rendezVous = await db.rendezVous.findAll({
            where: {
                id_med: docId
            }
        });
        const patients = await db.patient.findAll();


        const mappedRendezVous = rendezVous.map(r => {
            const patient = patients.find(p => p.id === r.id_pat);

            return {
                ...r.toJSON(),
                patientName: patient ? patient.LName + " " + patient.FName : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown',

            };
        });
        res.status(200).json(mappedRendezVous);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



module.exports = { getRendezVousByDoctor, addRendezVous, getRendezVousByPatient, deleteRendezVous, updateRendezVous, getAllRendezVous, getRendezVousById, getRendezVousByPatient };