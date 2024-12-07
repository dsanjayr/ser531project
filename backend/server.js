require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const winston = require('winston'); // For logging
const Joi = require('joi'); // For input validation


const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Replace with your actual GraphDB repository endpoint
const GRAPHDB_URL = process.env.GRAPHDB_URL;
const AUTH = {
    auth: {
        username: process.env.GRAPHDB_USER,
        password: process.env.GRAPHDB_PASSWORD
    }
};

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

// Function to execute SPARQL query against GraphDB
async function executeSparqlQuery(query) {
    try {
        logger.info('Executing SPARQL query', { query });
        const response = await axios.post(
            `${GRAPHDB_URL}/statements`,
            { query },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                ...AUTH,
            }
        );
        return response.data;
    } catch (error) {
        logger.error('Error executing SPARQL query', { error: error.message });
        if (error.response) {
            logger.error('GraphDB Response Error', { data: error.response.data });
        }
        throw new Error('Failed to execute SPARQL query');
    }
}

// Validation schema using Joi
const searchSchema = Joi.object({
    age: Joi.object({
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
    }).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    cholesterol: Joi.object({
        min: Joi.number().min(0).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
    }).required(),
});

// Simple GET route for the root URL
app.get('/', (req, res) => {
    res.send('Hello, welcome to the server!');
});

// Endpoint to handle query requests from the frontend
app.post('/search', async (req, res) => {
    const { error, value } = searchSchema.validate(req.body);

    // Validate user input
    if (error) {
        logger.warn('Validation failed', { error: error.message });
        return res.status(400).json({ status: 'error', message: 'Invalid input', details: error.message });
    }

    const { age, gender, cholesterol } = value;

    // Construct SPARQL query using template literals
    const query = `
    PREFIX smw1: <http://www.semanticweb.org/ser531/ontologies-sdhisley/Medical1#>
    PREFIX smw2: <http://www.semanticweb.org/ser531/ontologies-sdhisley/Medical2#>
    PREFIX smw3: <http://www.semanticweb.org/ser531/ontologies-sdhisley/Medical3#>
    PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

    SELECT ?patient ?cholesterol ?max_hr ?age ?diabetes
    WHERE {
    # Cholesterol and diabetes classification from file 2 (Medical2)
    ?patient smw2:hasCholesterolLevel ?cholesterol ;
           smw2:hasAge ?age ;
           smw2:hasDiabetesClassification ?diabetes .
  
    # Maximum heart rate from file 1 (Medical1) - Optional
    OPTIONAL { ?patient smw1:hasMaximumHeartRate ?max_hr . }
  
    FILTER (xsd:decimal(?cholesterol) >= 4)
    }`;

    try {
        const result = await executeSparqlQuery(query);

        // Return result in a clean format
        const bindings = result.results?.bindings || [];
        const formattedResults = bindings.map((binding) => ({
            patient: binding.patient?.value,
            age: binding.age?.value,
            gender: binding.gender?.value,
            cholesterol: binding.cholesterol?.value,
        }));

        logger.info('Query successful', { count: formattedResults.length });
        res.json({ status: 'success', count: formattedResults.length, data: formattedResults });
    } catch (error) {
        logger.error('SPARQL query execution failed', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Failed to execute SPARQL query', details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`);
});
