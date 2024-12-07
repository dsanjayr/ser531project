import React, { useState } from 'react';
import axios from 'axios';

function QueryForm() {
    const [formData, setFormData] = useState({
        age: '',
        gender: '',
        cholesterol: '',
        heartRate: ''
    });

    const [results, setResults] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        console.log('PPP handleSubmit')
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/search', formData);
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Age (e.g., 20-30):
                    <input type="text" name="age" value={formData.age} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Gender:
                    <input type="text" name="gender" value={formData.gender} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Cholesterol (e.g., 200-230):
                    <input type="text" name="cholesterol" value={formData.cholesterol} onChange={handleChange} />
                </label>
                <br />
                <label>
                    Heart Rate (e.g., 70-80):
                    <input type="text" name="heartRate" value={formData.heartRate} onChange={handleChange} />
                </label>
                <br />
                <button type="submit">Search</button>
            </form>

            <div>
                <h2>Results:</h2>
                {results.length > 0 ? (
                    <ul>
                        {results.map((row, index) => (
                            <li key={index}>{JSON.stringify(row)}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>
        </div>
    );
}

export default QueryForm;
