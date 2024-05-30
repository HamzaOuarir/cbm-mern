const db = require("../models/index");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const { extensions } = require("sequelize/lib/utils/validator-extras");
const path = require('path');
const fs = require('fs-extra');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');

const addUser = async (req, res) => {
    try {
        const { username, email, password, nom, prenom, role, cin, phone } = req.body;
        const file = req.files[0];
        const sanitized_folder_name = cin.replace(/[^a-z0-9]/gi, '_');
        const currentYear = (new Date()).getFullYear().toString();

        // Check if user with same username or cin already exists
        const existingUser = await db.user.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { CIN: cin }, { email }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Un utilisateur avec ce nom d\'utilisateur ou CIN ou E-mail existe déjà' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const newUser = await db.user.create({
            username,
            email,
            password: hashedPassword,
            nom,
            prenom,
            role,
            phone,
            CIN: cin
        });

        const FolderPath = path.join(__dirname, '..', 'files', 'doctors', `${currentYear}`, sanitized_folder_name);
        if (!fs.existsSync(FolderPath)) {
            fs.mkdirSync(FolderPath, { recursive: true });
        }
        console.log(FolderPath);

        // Generate a new file name with the current date and original name
        const newFileName = `doctor@profilephoto.png`;
        const filePath = path.join(FolderPath, newFileName);

        // Move the file with the new name to the patient folder
        fs.renameSync(file.path, filePath);

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};




const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const doctor = await db.user.findByPk(userId);
        console.log(doctor)
        const deletedUser = await db.user.destroy({
            where: {
                id: userId,
            },
        });

        const sanitized_folder_name = doctor.CIN.replace(/[^a-z0-9]/gi, '_');
        // const currentYear = (new Date()).getFullYear().toString();
        const FolderPath = path.join(__dirname, '..', 'files', 'doctors', `2024`, sanitized_folder_name);

        fs.removeSync(FolderPath);

        res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};





const updateUser = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.params.id;
        const { username, email, nom, CIN, prenom, phoneNumber } = req.body;
        const user = await db.user.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user with same username or cin already exists
        const existingUser = await db.user.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { CIN }, { email }
                ]
            }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Un utilisateur avec ce nom d\'utilisateur ou CINou E-mail  existe déjà' });
        }

        user.username = username;
        user.email = email;
        user.nom = nom;
        user.prenom = prenom;
        user.phone = phoneNumber;

        // Check if a new image file was uploaded
        if (req.files && req.files.length > 0) {
            const newImageFile = req.files[0];
            const sanitized_folder_name = CIN.replace(/[^a-z0-9]/gi, '_');
            const newFileName = `doctor@profilephoto.png`;
            const newFilePath = path.join(__dirname, '..', 'files', 'doctors', `2024`, sanitized_folder_name, newFileName);

            // Ensure the directory exists
            fs.mkdirSync(path.dirname(newFilePath), { recursive: true });

            // Remove the old picture file if it exists
            if (user.PHOTO && fs.existsSync(user.PHOTO)) {
                fs.unlinkSync(user.PHOTO);
            }

            fs.renameSync(newImageFile.path, newFilePath);
            user.PHOTO = newFilePath;
        }

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};



// const getAllUsers = async (req, res) => {
//     try {
//         const users = await db.user.findAll();
//         res.status(200).json(users);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error' });
//     }
// };


const getAllUsers = async (req, res) => {
    try {
        const users = await db.user.findAll();

        res.send(users);
    } catch (err) {
        console.log(err);
        console.error(err);
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await db.user.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



const Login = async (req, res) => {
    try {
        const user = await db.user.findOne({
            where: {
                username: req.body.username
            },
            // include: [{ model: Permission }],
        });

        if (!user) {
            return res.status(404).send({ message: "Utilisateur non trouvé." });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Mot de passe incorrect!"
            });
        }

        const token = jwt.sign({ id: user.id }, config.SECRET, {
            expiresIn: 7200,
        });

        // const permissions = await user.getPermissions();
        // const permissionsArray = permissions.map(permission => permission.name);

        res.status(200).send({
            id: user.id,
            username: user.username,
            email: user.email,
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
            accessToken: token,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({ message: err.message });
    }
};


// const Login = async (req, res) => {

//     try {
//         const { username, password } = req.body;
//         if (!username || !password) {
//             return res.status(400).send({
//                 error: 'error'
//             });
//         }
//         const user = await db.user.findOne({ where: { username } });
//         if (user) {
//             const passCheck = await bcrypt.compare(password, user.password);
//             if (!passCheck) {
//                 return res.status(500).send({
//                     error: 'invalid info .'
//                 });
//             } else {
//                 console.log(user._id);
//                 const token = jwt.sign({ userId: user._id },
//                     config.SECRET, { expiresIn: 7200 });
//                 return res.status(200).send({
//                     token
//                 });
//             }
//         } else {
//             return res.status(400).send({
//                 error: 'invalid info .'
//             });
//         }
//     } catch (error) {
//         return res.status(500).send({
//             error: error.message
//         });
//     }
// };





const updatePassword = (req, res) => {
    const { id } = req.params;
    const { newPassword, oldPassword } = req.body;
    console.log(req.body);
    db.user.findByPk(id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            bcrypt.compare(oldPassword, user.password, (err, isMatch) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ message: 'Internal server error' });
                }

                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid current password' });
                }

                bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }

                    user.password = hashedPassword;
                    user.save()
                        .then(() => {
                            res.status(200).json({ message: 'Password updated successfully' });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.status(500).json({ message: 'Internal server error' });
                        });
                });
            });
        })
        .catch((error) => {
            console.log(error);
            res.status(500).json({ message: 'Internal server error' });
        });
};





const getUserByWithPatient = async (req, res) => {
    try {
        const userId = req.params.id;

        // Use a raw SQL query to fetch patients associated with the user and count of consultations for each patient
        const patientsWithConsultationCount = await db.sequelize.query(
            `SELECT p.*, COUNT(c.id) AS consultation_count
            FROM patients p
            JOIN consultations c ON p.id = c.id_pat
            WHERE c.id_med = :userId
            GROUP BY p.id`, {
            replacements: { userId },
            type: Sequelize.QueryTypes.SELECT
        }
        );

        console.log(patientsWithConsultationCount);
        res.status(200).json(patientsWithConsultationCount);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};




const getDocphoto = async (req, res) => {
    try {
        const docId = req.params.docId;
        const doctor = await db.user.findByPk(docId);

        if (!doctor) {
            return res.status(404).send({ message: 'doctor not found' });
        }

        const CIN = doctor.CIN;
        // const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = CIN.replace(/[^a-z0-9]/gi, '_');
        const doctorFolder = path.join(__dirname, `../files/doctors/2024/${sanitized_folder_name}`);

        if (fs.existsSync(doctorFolder)) {
            const doctorFiles = fs.readdirSync(doctorFolder);

            // Filter files to find the one with the name "photoprofile"
            const photoProfileFile = doctorFiles.find(file => file.includes('doctor@profilephoto.png'));
            console.log(photoProfileFile);
            if (photoProfileFile) {
                // Return the file name
                const [date, name] = photoProfileFile.split('@');

                res.json({ date, name });
            } else {
                res.status(404).json({ error: 'photoprofile file not found' });
            }
        } else {
            res.status(404).json({ error: 'doctor files directory not found' });
        }
    } catch (err) {
        console.error('Error get files:', err);
        return res.status(500).send({
            message: err.message || 'Some error occurred while uploading files to the project.',
        });
    }
};






const getDocFileContent = async (req, res) => {
    try {
        const docId = req.params.docId;
        const fileName = req.params.fileName;
        const doctor = await db.user.findByPk(docId);


        if (!doctor) {
            console.log('patient not found');
            return res.status(404).send({ message: 'patient not found' });
        }

        const full_name = doctor.CIN;
        // const currentYear = (new Date()).getFullYear().toString();
        const sanitized_folder_name = full_name.replace(/[^a-z0-9]/gi, '_');
        const doctortFolder = path.join(__dirname, `../files/doctors/2024/${sanitized_folder_name}`);

        const filePath = path.join(doctortFolder, fileName);

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

var nodemailer = require('nodemailer');

const resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await db.user.findOne({
            where: {
                email: email
            },
        });

        if (!user) {
            console.log(user);
            res.status(404).json({ message: 'Aucun utilisateur avec cet e-mail.' });
        } else {
            const token = jwt.sign({ id: user.id }, config.SECRET, {
                expiresIn: 7200,
            });

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'warirhamza43@gmail.com',
                    pass: 'cvlugtaoqjkffxfa'
                }
            });

            var mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Réinitialisation du mot de passe',
                html: `
                    <p>Bonjour,</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <p><a href="http://localhost:3000/reset-password/${user.id}/${token}">Réinitialiser le mot de passe</a></p>
                    <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet e-mail.</p>
                    <p>Cordialement,</p>
                    <p>Votre équipe</p>
                `
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.status(500).json({ message: 'Erreur d\'envoi de l\'e-mail.' });
                } else {
                    res.status(200).json({ message: 'E-mail de réinitialisation envoyé avec succès.' });
                }
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};





const modifyPassword = async (req, res) => {
    const { id, token } = req.params;
    const { newPassword } = req.body;
    console.log(newPassword);
    console.log(id, token);
    const user = await db.user.findByPk(id);
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    jwt.verify(token, config.SECRET, (err, decoded) => {
        if (err) {
            console.log('Token verification error:', err);
            console.error('Token verification error:', err);
            return res.status(401).send({
                message: 'Unauthorized!',
            });
        } else {
            user.password = hashedPassword;
            user.save();
            return res.status(200).send({
                message: 'good',
            });
        }


    });


};


module.exports = { resetPassword, modifyPassword, getDocFileContent, getDocphoto, getUserByWithPatient, addUser, deleteUser, updateUser, getAllUsers, getUserById, updatePassword, Login };