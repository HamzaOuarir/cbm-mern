const db = require("../models/index");

const addOrdonnance = async(req, res) => {
    try {
        const { id_cons } = req.body;
        const newOrdonnance = await db.ordonnance.create({
            id_cons,
        });
        res.status(201).json(newOrdonnance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const deleteOrdonnance = async(req, res) => {
    try {
        const ordonnanceId = req.params.id;
        const deletedOrdonnance = await db.ordonnance.destroy({
            where: {
                id: ordonnanceId,
            },
        });
        res.status(200).json({ message: 'Ordonnance deleted successfully', deletedOrdonnance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const updateOrdonnance = async(req, res) => {
    try {
        const ordonnanceId = req.params.id;
        const { id_cons } = req.body;
        const ordonnance = await db.ordonnance.findByPk(ordonnanceId);
        ordonnance.id_cons = id_cons;

        await ordonnance.save();

        res.status(200).json({ message: 'Ordonnance updated successfully', ordonnance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getAllOrdonnances = async(req, res) => {
    try {
        const ordonnances = await db.ordonnance.findAll();
        res.status(200).json(ordonnances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getOrdonnanceById = async(req, res) => {
    try {
        const ordonnanceId = req.params.id;
        const ordonnance = await db.ordonnance.findByPk(ordonnanceId);
        if (!ordonnance) {
            return res.status(404).json({ message: 'Ordonnance not found' });
        }
        res.status(200).json(ordonnance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

module.exports = { addOrdonnance, deleteOrdonnance, updateOrdonnance, getAllOrdonnances, getOrdonnanceById };