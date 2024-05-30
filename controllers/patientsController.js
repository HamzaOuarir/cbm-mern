const db = require("../models/index");
const path = require('path');
const fs = require('fs-extra');
const { log } = require("console");

const uploadFileToPatient = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = patient.createdAt.getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        if (!fs.existsSync(patientFolder)) {
            console.log('patient folder not found');
            return res.status(404).send({ message: 'patient folder not found' });
        }

        const files = req.files;
        if (!files) {
            return res.status(400).send({ message: 'No files uploaded' });
        }

        files.forEach((file) => {
            // Generate a new file name with the current date and original name
            const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
            const newFileName = `${currentDate}@${file.originalname}`;
            const filePath = path.join(patientFolder, newFileName);

            // Move the file with the new name to the patient folder
            fs.renameSync(file.path, filePath);
        });

        return res.status(200).send({ message: 'Files uploaded successfully' });
    } catch (err) {
        console.error('Error uploading files:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while uploading files to the project.',
        });
    }
};


const getPatientFiles = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        if (fs.existsSync(patientFolder)) {
            const patientFiles = fs.readdirSync(patientFolder);

            // Splitting file names into date and name components
            const filesInfo = patientFiles.map((file) => {
                const [date, name] = file.split('@');
                return { date, name };
            });

            res.json(filesInfo);
        } else {
            res.status(404).json({ error: 'patient files directory not found' });
        }
    } catch (err) {
        console.error('Error get files:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while uploading files to the project.',
        });
    }
};

const getFileContent = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const fileName = req.params.fileName;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        const filePath = path.join(patientFolder, fileName);

        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'base64');

            res.send(fileContent);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error('Error getting file content:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while fetching file content.',
        });
    }
};

const downloadFile = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const fileName = req.params.fileName;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        const filePath = path.join(patientFolder, fileName);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-disposition', `attachment; filename = $ { fileName }`);
            res.setHeader('Content-type', 'application/msword');

            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.log('Error file:', err);
        console.error('Error downloading file:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while downloading the file.',
        });
    }
};

const deleteFile = async (req, res) => {

    try {
        const patientId = req.params.patientId;
        const fileName = req.params.fileName;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        const filePath = path.join(patientFolder, fileName);

        if (fs.existsSync(filePath)) {
            // Delete the file
            fs.unlinkSync(filePath);

            res.status(200).json({ message: 'File deleted successfully' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (err) {
        console.error('Error deleting file:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while deleting the file.',
        });
    }
};



const addPatient = async (req, res) => {
    try {
        const {
            FName,
            LName,
            CIN,
            dateNes,
            phone,
            gender,
            address,

        } = req.body;
        const file = req.files[0];

        const sanitized_folder_name = CIN.replace(/[^a-z0-9]/gi, '_');
        const currentYear = (new Date()).getFullYear().toString();



        const newPatient = await db.patient.create({
            FName,
            LName,
            CIN,
            dateNes,
            PHONE: phone,
            GENDER: gender,
            ADDRESSE: address,
        });
        const FolderPath = path.join(__dirname, '..', 'files', 'patients', `${currentYear}`, sanitized_folder_name);
        if (!fs.existsSync(FolderPath)) {
            fs.mkdirSync(FolderPath, { recursive: true });
        }
        console.log(FolderPath);
        // Generate a new file name with the current date and original name
        const newFileName = `patient@profilephoto.png`;
        const filePath = path.join(FolderPath, newFileName);

        // Move the file with the new name to the patient folder
        fs.renameSync(file.path, filePath);

        res.status(201).json(newPatient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



const deletePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const isChecked = req.params.isChecked; // Get the value of isChecked from the request parameters

        // Find the patient to get the CIN
        const patient = await db.patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Delete the patient from the database
        const deletedPatient = await db.patient.destroy({
            where: {
                id: patientId,
            },
        });

        // Get the sanitized folder name
        const sanitized_folder_name = patient.CIN.replace(/[^a-z0-9]/gi, '_');
        const currentYear = (new Date()).getFullYear().toString();
        const FolderPath = path.join(__dirname, '..', 'files', 'patients', `${currentYear}`, sanitized_folder_name);

        // Check if the patient folder exists and isChecked is true, then delete it
        if (isChecked === 'true' && fs.existsSync(FolderPath)) {
            fs.removeSync(FolderPath);
        }

        res.status(200).json({ message: 'Patient deleted successfully', deletedPatient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};





const updatePatient = async (req, res) => {
    try {
        const patientId = req.params.id;
        const { FName, LName, CIN, dateNes, phone, address, gender, image } = req.body;
        const patient = await db.patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        const sanitized_folder_name = CIN.replace(/[^a-z0-9]/gi, '_');
        const currentYear = (new Date()).getFullYear().toString();
        patient.FName = FName;
        patient.LName = LName;
        patient.CIN = CIN;
        patient.dateNes = dateNes;
        patient.PHONE = phone;
        patient.GENDER = gender;
        patient.ADDRESSE = address;

        // Check if a new image file was uploaded
        if (req.files && req.files.length > 0) {
            const newImageFile = req.files[0];
            const newFileName = `patient@profilephoto.png`;
            const newFilePath = path.join(__dirname, '..', 'files', 'patients', `${currentYear}`, sanitized_folder_name, newFileName);

            // Remove the old picture file
            if (fs.existsSync(patient.PHOTO)) {
                fs.unlinkSync(patient.PHOTO);
            }

            // Move the new picture file to the specified location
            fs.renameSync(newImageFile.path, newFilePath);
            patient.PHOTO = newFilePath;
        }

        await patient.save();

        res.status(200).json({ message: 'Patient updated successfully', patient });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};


const getAllPatients = async (req, res) => {
    try {
        const patients = await db.patient.findAll();
        res.status(200).json(patients);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};

const getPatientById = async (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = await db.patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        console.log(patient.createdAt);
        res.status(200).json(patient);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};










const getPatientPhoto = async (req, res) => {
    try {
        const patientId = req.params.patientId;
        const patient = await db.patient.findByPk(patientId);

        if (!patient) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = patient.CIN;
        const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const patientFolder = path.join(__dirname, `../files/patients/${currentYear}/${sanitized_folder_name}`);

        if (fs.existsSync(patientFolder)) {
            const patientFiles = fs.readdirSync(patientFolder);

            // Filter files to find the one with the name "photoprofile"
            const photoProfileFile = patientFiles.find(file => file.includes('patient@profilephoto.png'));
            console.log(photoProfileFile);
            if (photoProfileFile) {
                // Return the file name
                const [date, name] = photoProfileFile.split('@');

                res.json({ date, name });
            } else {
                res.status(404).json({ error: 'photoprofile file not found' });
            }
        } else {
            res.status(404).json({ error: 'patient files directory not found' });
        }
    } catch (err) {
        console.error('Error get files:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while uploading files to the project.',
        });
    }
};














module.exports = { getFileContent, getPatientPhoto, downloadFile, deleteFile, getPatientFiles, addPatient, deletePatient, uploadFileToPatient, updatePatient, getAllPatients, getPatientById };