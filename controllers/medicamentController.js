const db = require("../models/index");

const addMedicament = async (req, res) => {
    try {
        const { name, id_ord } = req.body;
        const newMedicament = await db.medicament.create({
            name,
            id_ord,
        });
        res.status(201).json(newMedicament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const deleteMedicament = async (req, res) => {
    try {
        const medicamentId = req.params.id;
        const deletedMedicament = await db.medicament.destroy({
            where: {
                id: medicamentId,
            },
        });
        res.status(200).json({ message: 'Medicament deleted successfully', deletedMedicament });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const updateMedicament = async (req, res) => {
    try {
        const medicamentId = req.params.id;
        const { name, id_ord } = req.body;
        const medicament = await db.medicament.findByPk(medicamentId);
        medicament.name = name;
        medicament.id_ord = id_ord;

        await medicament.save();

        res.status(200).json({ message: 'Medicament updated successfully', medicament });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getAllMedicaments = async (req, res) => {
    try {
        const medicaments = await db.medicament.findAll();
        res.status(200).json(medicaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getMedicamentById = async (req, res) => {
    try {
        const medicamentId = req.params.id;
        const medicament = await db.medicament.findByPk(medicamentId);
        if (!medicament) {
            return res.status(404).json({ message: 'Medicament not found' });
        }
        res.status(200).json(medicament);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getMedicamentsByOrd = async (req, res) => {
    try {
        const orderId = req.params.id;
        const medicaments = await db.medicament.findAll({
            where: { id_ord: orderId },
        });

        if (!medicaments || medicaments.length === 0) {
            return res.status(404).json({ message: 'No medicaments found for this order ID' });
        }

        res.status(200).json(medicaments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

module.exports = { addMedicament, deleteMedicament, updateMedicament, getAllMedicaments, getMedicamentById, getMedicamentsByOrd };