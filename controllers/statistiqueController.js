const db = require("../models/index");

const { Op } = require('sequelize');

const todayPatient = async (req, res) => {

    try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        const { count, rows: patients } = await db.patient.findAndCountAll({
            where: {
                createdAt: {
                    [Op.gte]: todayStart,
                    [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        res.status(200).json({ count, patients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
}


const todayRendezvous = async (req, res) => {
    try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        // Fetch rendezvous for today
        const { count, rows: rendezvous } = await db.rendezVous.findAndCountAll({
            where: {
                date: {
                    [Op.gte]: todayStart,
                    [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // Fetch patients associated with the rendezvous
        const patientIds = rendezvous.map(r => r.id_pat);
        const patients = await db.patient.findAll({
            where: {
                id: {
                    [Op.in]: patientIds
                }
            }
        });

        // Map rendezvous with patient names
        const mappedRendezvous = rendezvous.map(r => {
            const patient = patients.find(p => p.id === r.id_pat);
            return {
                ...r.toJSON(),
                patientName: patient ? `${patient.LName} ${patient.FName}` : 'Unknown'
            };
        });

        res.status(200).json({ count, rendezvous: mappedRendezvous });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



const todayPaymentsTotal = async (req, res) => {
    try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        const todayPayments = await db.paiment.findAll({
            where: {
                date: {
                    [Op.gte]: todayStart,
                    [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        // Fetch FName and LName for each payment
        const paymentsWithPatientDetails = await Promise.all(todayPayments.map(async payment => {
            const patient = await db.patient.findByPk(payment.id_pat, {
                attributes: ['FName', 'LName']
            });
            console.log(patient);
            return {
                ...payment.toJSON(),
                patient: patient ? patient.toJSON() : null
            };
        }));

        const totalAmount = paymentsWithPatientDetails.reduce((sum, payment) => sum + payment.montant, 0);

        res.status(200).json({ todayPayments: paymentsWithPatientDetails, totalAmount });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
}




const todayConsultations = async (req, res) => {
    try {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

        const consultations = await db.consultation.findAll({
            where: {
                date: {
                    [Op.gte]: todayStart,
                    [Op.lt]: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            attributes: ['id', 'date', 'id_pat', 'prix'],
            raw: true
        });

        // Fetch FName and LName of patients associated with consultations
        const consultationsWithPatients = await Promise.all(consultations.map(async (consultation) => {
            const { id, date, id_pat, prix } = consultation;
            const patient = await db.patient.findOne({
                where: { id: id_pat },
                attributes: ['FName', 'LName'],
                raw: true
            });

            // If patient not found, set FName and LName to "Unknown"
            const patientFName = patient ? patient.FName : 'Unknown';
            const patientLName = patient ? patient.LName : 'Unknown';

            return { id, date, patientFName, patientLName, prix };
        }));

        res.status(200).json({ count: consultationsWithPatients.length, consultations: consultationsWithPatients });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};



const getPatientsThisMonth = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const patientCounts = [];

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const { count } = await db.patient.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: dayStart,
                        [Op.lt]: dayEnd
                    }
                }
            });

            const dayNumber = currentDate.getDate();
            patientCounts.push({ day: dayNumber, nbr: count });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json(patientCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for this month' });
    }
}

const getPatientsThisYear = async (req, res) => {
    try {
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];
        const today = new Date();
        const currentYear = today.getFullYear();
        const months = Array.from({ length: 12 }, (_, index) => index);

        const patientCounts = [];

        for (const month of months) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = new Date(currentYear, month + 1, 0);

            const { count } = await db.patient.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            // Get the abbreviated name of the month
            const monthName = monthNames[month];

            patientCounts.push({ month: monthName, nbr: count });
        }

        res.status(200).json(patientCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for this year' });
    }
}

const getPaimentsTotalByDay = async (req, res) => {
    try {
        const today = new Date(); // Set today's date to Monday 6/5/2024
        const todayDayOfWeek = today.getDay();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


        // Calculate start of the current week and past week
        const startOfCurrentWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - todayDayOfWeek);
        const startOfPastWeek = new Date(startOfCurrentWeek.getFullYear(), startOfCurrentWeek.getMonth(), startOfCurrentWeek.getDate() - 7);

        const paimentsCurrentWeek = await db.paiment.findAll({
            where: {
                date: {
                    [Op.gte]: startOfCurrentWeek,
                    [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
            }
        });

        const paimentsPastWeek = await db.paiment.findAll({
            where: {
                date: {
                    [Op.gte]: startOfPastWeek,
                    [Op.lt]: startOfCurrentWeek
                }
            }
        });

        const totalAmountsCurrentWeek = {};
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfCurrentWeek);
            currentDate.setDate(currentDate.getDate() + i);
            const dayIndex = currentDate.getDay();
            totalAmountsCurrentWeek[daysOfWeek[dayIndex]] = 0;
        }
        paimentsCurrentWeek.forEach(paiment => {
            const day = new Date(paiment.date).getDay();
            totalAmountsCurrentWeek[daysOfWeek[day]] += paiment.montant;
        });

        const totalAmountsPastWeek = {};
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfPastWeek);
            currentDate.setDate(currentDate.getDate() + i);
            const dayIndex = currentDate.getDay();
            totalAmountsPastWeek[daysOfWeek[dayIndex]] = 0;
        }
        paimentsPastWeek.forEach(paiment => {
            const day = new Date(paiment.date).getDay();
            totalAmountsPastWeek[daysOfWeek[day]] += paiment.montant;
        });

        const data = daysOfWeek.map(day => ({
            day,
            thisWeek: totalAmountsCurrentWeek[day] || 0,
            pastWeek: totalAmountsPastWeek[day] || 0
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};


const getTodayPaimentsWithPatientInfo = async (req, res) => {
    try {
        const today = new Date();
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
        const paiments = await db.paiment.findAll({
            where: {
                date: {
                    [Op.gte]: startOfWeek,
                    [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
                }
            },
            limit: 5,
            order: [
                ['montant', 'DESC']
            ]
        });

        const patients = await db.patient.findAll();

        const paimentsWithPatientInfo = paiments.map(paiment => {
            const patient = patients.find(patient => patient.id === paiment.id_pat);
            return {
                ...paiment.toJSON(),
                patientName: patient ? `${patient.LName} ${patient.FName}` : 'Unknown Unknown',
                patientPhone: patient ? patient.PHONE : 'Unknown'
            };
        });
        res.status(200).json(paimentsWithPatientInfo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
};






const getConsultationsThisMonth = async (req, res) => {
    try {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        const consultationsCounts = [];
        let weekNumber = 1;
        let currentWeekStart = new Date(startDate);

        while (currentWeekStart <= endDate) {
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);
            if (currentWeekEnd > endDate) {
                currentWeekEnd.setDate(endDate.getDate() + 1);
            }

            const { count } = await db.consultation.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: currentWeekStart,
                        [Op.lt]: currentWeekEnd
                    }
                }
            });

            consultationsCounts.push({ week: `Week ${weekNumber}`, count });
            weekNumber++;
            currentWeekStart = currentWeekEnd;
        }

        res.status(200).json(consultationsCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for this month' });
    }
}


const getConsultationsThisYear = async (req, res) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];


        const months = Array.from({ length: 12 }, (_, index) => index);

        const consultationsCounts = [];

        for (const month of months) {
            const startDate = new Date(currentYear, month, 1);
            const endDate = new Date(currentYear, month + 1, 0);

            const count = await db.consultation.count({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            consultationsCounts.push({ month: monthNames[month], count });
        }

        res.status(200).json(consultationsCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get consultations counts for this year' });
    }
}





const getConsultationsThisWeek = async (req, res) => {
    try {
        const today = new Date();
        const currentDay = today.getDay();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - currentDay);
        const endDate = new Date(today);
        endDate.setDate(endDate.getDate() + (6 - currentDay));

        const consultationsCounts = [];

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

            const { count } = await db.consultation.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: dayStart,
                        [Op.lt]: dayEnd
                    }
                }
            });
            const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            consultationsCounts.push({ day: dayOfWeek, count });
            currentDate.setDate(currentDate.getDate() + 1);
        }

        res.status(200).json(consultationsCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for this week' });
    }
}

const getPatientsWithRendezVousByMonth = async (req, res) => {
    try {
        const today = new Date();
        const currentYear = today.getFullYear();

        const patientCounts = [];

        // Array of months
        const months = Array.from({ length: 12 }, (_, i) => i);

        for (const month of months) {
            const monthStart = new Date(currentYear, month, 1);
            const monthEnd = new Date(currentYear, month + 1, 0);

            const rendezVousPatients = await db.rendezVous.findAll({
                attributes: ['id_pat'],
                where: {
                    date: {
                        [Op.gte]: monthStart,
                        [Op.lt]: monthEnd
                    }
                },
                group: ['id_pat']
            });

            // Filter out id_pat that don't exist in the patient table
            const existingPatients = await Promise.all(rendezVousPatients.map(async (rendezVous) => {
                const patient = await db.patient.findOne({
                    where: {
                        id: rendezVous.id_pat
                    }
                });
                return patient ? rendezVous.id_pat : null;
            }));

            const patientCountWithRendezVous = existingPatients.filter(Boolean).length;

            const totalPatients = await db.patient.count({
                where: {
                    createdAt: {
                        [Op.gte]: monthStart,
                        [Op.lt]: monthEnd
                    }
                }
            });

            // Check if there are any patients in the current month
            if (totalPatients > 0) {
                const patientWithRendezVous = Math.max(0, patientCountWithRendezVous);
                const patientsWithoutRendezVous = Math.max(0, totalPatients - patientCountWithRendezVous);

                const monthName = monthStart.toLocaleDateString('en-US', { month: 'long' });

                patientCounts.push({
                    month: monthName,
                    patientWithRendezVous,
                    patientsWithoutRendezVous
                });
            } else {
                const monthNames = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];

                patientCounts.push({
                    month: monthNames,
                    patientWithRendezVous: 0,
                    patientsWithoutRendezVous: 0
                });
            }
        }

        res.status(200).json(patientCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts with rendezvous for each month of this year' });
    }
}


const getPatientsByMonth = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const patientCounts = [];
        const weekStartDates = [];

        // Find the start date of each week within the specified month
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Sunday
            weekStartDates.push(weekStartDate);
            currentDate.setDate(currentDate.getDate() + 7); // Move to next week
        }

        // Iterate through each week and calculate patient counts
        for (let i = 0; i < weekStartDates.length; i++) {
            const weekStartDate = weekStartDates[i];
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Set to Saturday

            const { count } = await db.patient.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: weekStartDate,
                        [Op.lte]: weekEndDate
                    }
                }
            });

            patientCounts.push({ week: i + 1, count: count });
        }

        res.status(200).json(patientCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for the specified month' });
    }
}
const getPatientsByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const patientCountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const { count } = await db.patient.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            patientCountsByMonth.push({ month: monthNames[month], count });
        }

        res.status(200).json(patientCountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for the specified year' });
    }
}



const getDistinctYearsWithPatients = async (req, res) => {
    try {
        // Fetch all createdAt values
        const allCreatedAt = await db.patient.findAll({
            attributes: ['createdAt'],
            where: {
                createdAt: {
                    [Op.ne]: null
                }
            }
        });

        // Extract distinct years from createdAt values
        const yearsWithPatients = allCreatedAt.map(record => new Date(record.createdAt).getFullYear());
        const distinctYears = Array.from(new Set(yearsWithPatients));

        res.status(200).json(distinctYears);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get distinct years with patients' });
    }
};



const { literal } = require('sequelize');

const getPatientsMoreThan2ConsByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const patientCountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const patients = await db.patient.findAll({
                attributes: ['id'],
                where: literal(`(
                    SELECT COUNT(*)
                    FROM consultations
                    WHERE consultations.id_pat = patients.id
                    AND consultations.date >= '${startDate.toISOString()}'
                    AND consultations.date <= '${endDate.toISOString()}'
                ) >= 2`)
            });

            patientCountsByMonth.push({ month: monthNames[month], count: patients.length });
        }

        res.status(200).json(patientCountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get patient counts for the specified year' });
    }
};





const getPaymentsByYear = async (req, res) => {
    try {
        const { year } = req.params;

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const paymentAmountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const { count } = await db.paiment.findAndCountAll({
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });


            paymentAmountsByMonth.push({ month: monthNames[month], count, });
        }
        res.status(200).json(paymentAmountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get payment information for the specified year' });
    }
};


const getTotalPaymentsByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const paymentAmountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const payments = await db.paiment.findAll({
                attributes: [
                    [db.sequelize.fn('SUM', db.sequelize.col('montant')), 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            const totalAmount = payments.length > 0 && payments[0].dataValues.totalAmount !== null ?
                payments[0].dataValues.totalAmount :
                0;

            paymentAmountsByMonth.push({ month: monthNames[month], totalAmount });
        }

        res.status(200).json(paymentAmountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get payment information for the specified year' });
    }
};

const getConsultationStatusByYear = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        const endDate = new Date(currentYear, 11, 31);

        const paidConsultationsCount = await db.consultation.count({
            where: {
                state: 'payé',
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const unpaidConsultationsCount = await db.consultation.count({
            where: {
                state: 'encours',
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const paidConsultations = await db.consultation.findAll({
            where: {
                state: 'payé',
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        const unpaidConsultations = await db.consultation.findAll({
            where: {
                state: 'encours',
                date: {
                    [Op.between]: [startDate, endDate]
                }
            }
        });

        // Fetch FName and LName of patients associated with unpaid consultations
        const unpaidConsultationsWithPatients = await Promise.all(unpaidConsultations.map(async (consultation) => {
            const { id, date, id_pat, prix } = consultation;
            const patient = await db.patient.findOne({
                where: { id: id_pat },
                attributes: ['FName', 'LName'],
                raw: true
            });

            // Set patient names to "Unknown" if not available
            const patientFName = patient ? patient.FName : 'Unknown';
            const patientLName = patient ? patient.LName : 'Unknown';

            return { id, date, patientFName, patientLName, prix };
        }));

        const data = {
            count: [
                { name: 'Paid', value: paidConsultationsCount },
                { name: 'Unpaid', value: unpaidConsultationsCount }
            ],
            listOfPaidCons: paidConsultations,
            listOfUnpaidCons: unpaidConsultationsWithPatients // Include patient names for unpaid consultations
        };

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get consultation status for the current year' });
    }
};


const getConsultationsByYear = async (req, res) => {
    try {
        const { year } = req.params;

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const consultationCountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const count = await db.consultation.count({
                where: {
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            consultationCountsByMonth.push({ month: monthNames[month], count });
        }

        res.status(200).json(consultationCountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get consultation information for the specified year' });
    }
};

const statistics = async (req, res) => {
    try {
        const today = new Date();
        const currentYearStart = new Date(today.getFullYear(), 0, 1, 0, 0, 0);

        // Consultations, appointments, patients, and payments for the current year
        const currentYearConsultations = await db.consultation.count({
            where: {
                date: {
                    [Op.gte]: currentYearStart
                }
            }
        });

        const currentYearRendezvous = await db.rendezVous.count({
            where: {
                date: {
                    [Op.gte]: currentYearStart
                }
            }
        });

        const currentYearPatients = await db.patient.count({
            where: {
                createdAt: {
                    [Op.gte]: currentYearStart
                }
            }
        });

        const currentYearPayments = await db.paiment.count({
            where: {
                date: {
                    [Op.gte]: currentYearStart
                }
            }
        });

        // Consultations, appointments, patients, and payments for all time
        const allTimeConsultations = await db.consultation.count();
        const allTimeRendezvous = await db.rendezVous.count();
        const allTimePatients = await db.patient.count();
        const allTimePayments = await db.paiment.count();

        res.status(200).json({
            currentYear: {
                consultations: currentYearConsultations,
                rendezvous: currentYearRendezvous,
                patients: currentYearPatients,
                payments: currentYearPayments
            },
            allTime: {
                consultations: allTimeConsultations,
                rendezvous: allTimeRendezvous,
                patients: allTimePatients,
                payments: allTimePayments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error' });
    }
}


const getConsultationsByMonth = async (req, res) => {
    try {
        console.log(req.params);
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const consultationCounts = [];
        const weekStartDates = [];

        // Find the start date of each week within the specified month
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Sunday
            weekStartDates.push(weekStartDate);
            currentDate.setDate(currentDate.getDate() + 7); // Move to next week
        }

        // Iterate through each week and calculate consultation counts
        for (let i = 0; i < weekStartDates.length; i++) {
            const weekStartDate = weekStartDates[i];
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Set to Saturday

            const consultations = await db.consultation.findAll({
                where: {
                    date: {
                        [Op.gte]: weekStartDate,
                        [Op.lte]: weekEndDate
                    }
                }
            });

            consultationCounts.push({ week: "week " + (i + 1), count: consultations.length });
        }

        res.status(200).json(consultationCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get consultation counts for the specified month' });
    }
};

const getRendezvousByMonth = async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const rendezvousCounts = [];
        const weekStartDates = [];

        // Find the start date of each week within the specified month
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const weekStartDate = new Date(currentDate);
            weekStartDate.setDate(currentDate.getDate() - currentDate.getDay()); // Set to Sunday
            weekStartDates.push(weekStartDate);
            currentDate.setDate(currentDate.getDate() + 7); // Move to next week
        }

        // Iterate through each week and calculate rendezvous counts
        for (let i = 0; i < weekStartDates.length; i++) {
            const weekStartDate = weekStartDates[i];
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Set to Saturday

            const rendezvous = await db.rendezVous.findAll({
                where: {
                    date: {
                        [Op.gte]: weekStartDate,
                        [Op.lte]: weekEndDate
                    }
                }
            });

            rendezvousCounts.push({
                week: "week " + (i + 1),
                count: rendezvous.length
            });
        }

        res.status(200).json(rendezvousCounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get rendezvous counts for the specified month' });
    }
};

const getRendezvousByYear = async (req, res) => {
    try {
        const { year } = req.params;
        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const rendezvousCountsByMonth = [];

        for (let month = 0; month < 12; month++) {
            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);

            const { count } = await db.rendezVous.findAndCountAll({
                where: {
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                }
            });

            rendezvousCountsByMonth.push({ month: monthNames[month], count });
        }

        res.status(200).json(rendezvousCountsByMonth);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to get rendezvous counts for the specified year' });
    }
};

module.exports = {
    getRendezvousByYear,
    getRendezvousByMonth,
    getConsultationsByMonth,
    statistics,
    getConsultationsByYear,
    getConsultationStatusByYear,
    getPaymentsByYear,
    getPatientsMoreThan2ConsByYear,
    todayRendezvous,
    getTotalPaymentsByYear,
    getDistinctYearsWithPatients,
    getPatientsByYear,
    getPatientsWithRendezVousByMonth,
    getPatientsByMonth,
    getConsultationsThisWeek,
    getConsultationsThisYear,
    getConsultationsThisMonth,
    getTodayPaimentsWithPatientInfo,
    getPaimentsTotalByDay,
    todayPaymentsTotal,
    todayConsultations,
    todayPatient,
    getPatientsThisMonth,
    getPatientsThisYear
};