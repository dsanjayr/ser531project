require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const winston = require('winston');
const Joi = require('joi');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27031/patientdb';

// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'server.log' }),
    ],
});

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => logger.info('Connected to MongoDB'))
    .catch(error => {
        logger.error('Failed to connect to MongoDB', { error: error.message });
        process.exit(1);
    });

// Define Patient schema and model
const patientSchema = new mongoose.Schema({
    PatientID: { type: Number },
    Age: { type: Number },
    Gender: { type: String },
    Cholesterol: { type: Number },
    BP: { type: Number },
    MaxHR: { type: Number },
    HeartDisease: { type: String }
});

const Patient = mongoose.model('Patient', patientSchema);

// Validation schema for Advanced Search
const advancedSearchSchema = Joi.object({
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    ageMin: Joi.number().min(0).max(120).required(),
    ageMax: Joi.number().min(0).max(120).required(),
    cholesterolMin: Joi.number().min(0).optional(),
    cholesterolMax: Joi.number().min(0).optional()
});

// Advanced Search API
app.post('/advanced-search', async (req, res) => {
    const { error, value } = advancedSearchSchema.validate(req.body);
    if (error) {
        logger.warn('Validation failed for Advanced Search', { error: error.message });
        return res.status(400).json({ status: 'error', message: 'Invalid input', details: error.message });
    }

    const { gender, ageMin, ageMax, cholesterolMin, cholesterolMax } = value;

    try {
        // Construct the query
        const query = {
            Gender: gender,
        };
        if (ageMin !== undefined || ageMax !== undefined) {
            query.Age = {};
            if (ageMin !== undefined) query.Age.$gte = ageMin;
            if (ageMax !== undefined) query.Age.$lte = ageMax;
        }

        // Add Cholesterol conditions only if min or max are provided
        if (cholesterolMin !== undefined || cholesterolMax !== undefined) {
            query.Cholesterol = {};
            if (cholesterolMin !== undefined) query.Cholesterol.$gte = cholesterolMin;
            if (cholesterolMax !== undefined) query.Cholesterol.$lte = cholesterolMax;
        }

        const results = await Patient.find(query);

        logger.info('Advanced Search successful', { count: results.length });
        res.json({ status: 'success', count: results.length, data: results });
    } catch (error) {
        logger.error('Error in Advanced Search', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to fetch results', details: error.message });
    }
});

// Quick Search API
app.post('/quick-search', async (req, res) => {
    const queryParam = req.body.query || '';
    if (!queryParam) {
        return res.status(400).json({ status: 'error', message: 'Query parameter is required.' });
    }

    try {
        const regex = new RegExp(queryParam, 'i'); // Case-insensitive regex for string search
        const results = await Patient.find({
            $or: [
                { Gender: regex },
                { HeartDisease: regex },
                { Age: parseInt(queryParam) || undefined }, // Handle numeric input for Age
                { Cholesterol: parseInt(queryParam) || undefined } // Handle numeric input for Cholesterol
            ]
        });

        logger.info('Quick Search successful', { count: results.length });
        res.json({ status: 'success', count: results.length, data: results });
    } catch (error) {
        logger.error('Error in Quick Search', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to fetch results', details: error.message });
    }
});


// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Health Risk Prediction API!');
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
