const express = require('express');
const cors = require('cors');
const { json } = require('sequelize');
const app = express();
const db = require('./models')
const userRouter = require('./routes/userRouter')
const patientRouter = require('./routes/patientRouter')
const rendezVousRouter = require('./routes/rendezVousRouter')
const medicamentRouter = require('./routes/medicamentRouter')
const ordonnanceRouter = require('./routes/ordonnanceRouter')
const consultationsRouter = require('./routes/consultationsRouter')
const paimentRouter = require('./routes/paimentRouter')
const statistiqueRouter = require('./routes/statistiqueRouter')

require('dotenv').config();


const corsOptions = {
    origin: process.env.ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization',
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRouter);
app.use('/api/patients', patientRouter);
app.use('/api/rendezVous', rendezVousRouter);
app.use('/api/medicament', medicamentRouter);
app.use('/api/ordonnances', ordonnanceRouter);
app.use('/api/consultations', consultationsRouter);
app.use('/api/paiments', paimentRouter);

app.use('/api/statistique', statistiqueRouter);

const PORT = process.env.PORT || 8000;

db.sequelize.sync({
    force: false,
    //alter: true
}).then(() => {
    app.listen(PORT, () => { console.log("server is run"); });
})