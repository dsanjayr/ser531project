const { MongoClient } = require('mongodb');
const fs = require('fs');

const MONGO_URI = 'mongodb://localhost:27031';
const DATABASE_NAME = 'patientdb';
const COLLECTION_NAME = 'patients';
const DATA_FILE = 'patients.json'; // Original file with spaces in field names

async function importData() {
    let client;

    try {
        // Connect to MongoDB
        client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB at port 27031.');

        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Read and parse JSON file
        const rawData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));

        // Preprocess data: Remove spaces/special characters from field names
        const cleanedData = rawData.map(item => {
            return Object.keys(item).reduce((acc, key) => {
                const newKey = key
                    .replace(/ /g, '') // Remove spaces
                    .replace(/[^\w]/g, ''); // Remove special characters
                acc[newKey] = item[key];
                return acc;
            }, {});
        });

        // Insert cleaned data into the collection
        const result = await collection.insertMany(cleanedData);
        console.log(`Inserted ${result.insertedCount} records into '${COLLECTION_NAME}' collection.`);
    } catch (error) {
        console.error('Error importing data:', error.message);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

importData();
