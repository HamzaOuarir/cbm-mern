const db = require("../models/index");
const paiment = require("../models/paiment");

const addPaiment = async (req, res) => {
    try {
        const { montant, patientId, consultationId } = req.body;

        const consultation = await db.consultation.findByPk(consultationId);

        if (!consultation) {
            res.status(404).json({ message: 'consultation not found' });
        }
        const paimentMt = await db.paiment.sum('montant', {
            where: {
                id_cons: consultationId
            }
        });


        if (consultation.prix > parseFloat(paimentMt) + parseFloat(montant)) {
            const newPaiment = await db.paiment.create({
                montant,
                date: new Date(),
                id_pat: patientId,
                id_cons: consultationId,
            });
            await consultation.save();
            res.status(201).json(newPaiment);
        } else if (consultation.prix < parseFloat(paimentMt) + parseFloat(montant)) {

            res.status(500).json({ message: 'maontant Plus que le prix de la consultation' });
        } else {
            const newPaiment = await db.paiment.create({
                montant,
                date: new Date(),
                id_pat: patientId,
                id_cons: consultationId,
            });

            consultation.state = "payé";
            await consultation.save();
            res.status(201).json(newPaiment);
        }
        console.log(consultation.prix);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const deletePaiment = async (req, res) => {
    try {
        const paimentId = req.params.id;
        const paiment = await db.paiment.findByPk(paimentId);
        const deletedPaiment = await db.paiment.destroy({
            where: {
                id: paimentId,
            },
        });
        const consultation = await db.consultation.findByPk(paiment.id_cons);
        consultation.prix = consultation.prix + paiment.montant;
        consultation.state = "encours";
        await consultation.save();

        res.status(200).json({ message: 'Paiment deleted successfully', deletedPaiment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const updatePaiment = async (req, res) => {
    try {
        const paimentId = req.params.id;
        const { montant, date, patId, consultationId } = req.body;
        const paiment = await db.paiment.findByPk(paimentId)
        const consultation = await db.consultation.findByPk(consultationId);

        if (!consultation) {
            res.status(404).json({ message: 'consultation not found' });
        }
        //////////////////////////////////////////////////
        const paimentMt = await db.paiment.sum('montant', {
            where: {
                id_cons: consultationId
            }
        });
        const mtTotal = parseFloat(paimentMt) - parseFloat(paiment.montant) + parseFloat(montant)

        const newpaiment = await db.paiment.findByPk(paimentId);
        newpaiment.montant = montant;
        newpaiment.date = date;
        newpaiment.id_pat = patId;
        newpaiment.id_cons = consultationId;
        /*************************************************************/



        if (consultation.prix > mtTotal) {
            paiment.save();
            await consultation.save();
            res.status(201).json(paiment);
        } else if (consultation.prix < mtTotal) {
            res.status(500).json({ message: 'maontant Plus que le prix de la consultation' });
        } else {


            consultation.state = "payé";
            await consultation.save();
            res.status(201).json(paiment);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getAllPaiments = async (req, res) => {
    try {
        const paiments = await db.paiment.findAll();
        res.status(200).json(paiments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getPaimentById = async (req, res) => {
    try {
        const paimentId = req.params.id;
        const paiment = await db.paiment.findByPk(paimentId);
        if (!paiment) {
            return res.status(404).json({ message: 'Paiment not found' });
        }
        res.status(200).json(paiment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};





const getPaimentsWithPatientInfo = async (req, res) => {
    const idpat = req.params.idpat;

    try {
        const paiments = await db.paiment.findAll({
            where: {
                id_pat: idpat
            }
        });
        const patients = await db.patient.findAll();

        const paimentsWithPatientInfo = paiments.map(paiment => {
            const patient = patients.find(patient => patient.id === paiment.id_pat);
            return {
                ...paiment.toJSON(),
                patientName: patient ? `${patient.LName} ${patient.FName}` : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown'
            };
        });
        console.log(paimentsWithPatientInfo);
        res.status(200).json(paimentsWithPatientInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};







const getAllPaimentsWithPatientInfo = async (req, res) => {

    try {
        const paiments = await db.paiment.findAll();
        const patients = await db.patient.findAll();

        const paimentsWithPatientInfo = paiments.map(paiment => {
            const patient = patients.find(patient => patient.id === paiment.id_pat);
            return {
                ...paiment.toJSON(),
                patientName: patient ? `${patient.LName} ${patient.FName}` : 'Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown'
            };
        });
        console.log(paimentsWithPatientInfo);
        res.status(200).json(paimentsWithPatientInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



module.exports = { getPaimentsWithPatientInfo, getAllPaimentsWithPatientInfo, addPaiment, deletePaiment, updatePaiment, getAllPaiments, getPaimentById };