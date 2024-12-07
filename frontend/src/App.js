import React, { useState } from 'react';
import './App.css';

function HeartFailureRiskMeasurer() {
    const [formData, setFormData] = useState({
        gender: "",
        age: "",
        heartRate: "",
        bp: "",
        sugarLevel: "",
    });

    const [errors, setErrors] = useState({});
    const [riskResult, setRiskResult] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.gender.trim()) {
            errors.gender = "Gender is required";
        }
        if (!formData.age.trim() || isNaN(formData.age) || formData.age <= 0 || formData.age > 120) {
            errors.age = "Please enter a valid age (1-120)";
        }
        if (!formData.heartRate.trim() || isNaN(formData.heartRate) || formData.heartRate <= 0) {
            errors.heartRate = "Please enter a valid heart rate";
        }
        if (!formData.bp.trim() || isNaN(formData.bp) || formData.bp <= 0) {
            errors.bp = "Please enter a valid blood pressure";
        }
        if (!formData.sugarLevel.trim() || isNaN(formData.sugarLevel) || formData.sugarLevel <= 0) {
            errors.sugarLevel = "Please enter a valid sugar level";
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRiskPrediction = (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        let riskLevel = "Low"; // Default is Low Risk

        const age = parseInt(formData.age);
        const bp = parseInt(formData.bp);
        const heartRate = parseInt(formData.heartRate);
        const sugar = parseInt(formData.sugarLevel);

        // Low Risk Check: Age < 30, Normal Heart Rate, Normal BP, Normal Sugar
        if (age < 30) {
            if (heartRate >= 60 && heartRate <= 100 && bp < 120 && sugar < 100) {
                riskLevel = "Low"; // Low risk criteria met
            } else {
                riskLevel = "Medium"; // If heart rate, BP, or sugar level are abnormal, set Medium risk
            }
        }

        // Medium Risk: Age 30-45, Normal Heart Rate, Slightly Elevated BP or Sugar
        else if (age >= 30 && age < 45) {
            if (heartRate >= 60 && heartRate <= 100) {
                if (bp >= 120 && bp < 140) {
                    riskLevel = "Medium"; // Slightly elevated BP
                } else if (sugar >= 90 && sugar < 100) {
                    riskLevel = "Medium"; // Slightly elevated sugar
                } else {
                    riskLevel = "Low"; // Normal BP and sugar, low risk
                }
            }
        }

        // High Risk: Age 45-60, Elevated BP or Heart Rate issues, High Sugar
        else if (age >= 45 && age < 60) {
            if (heartRate < 60 || heartRate > 100) {
                riskLevel = "High"; // Abnormal heart rate
            } else if (bp >= 140) {
                riskLevel = "High"; // High BP
            } else if (sugar >= 100) {
                riskLevel = "High"; // High sugar
            }
        }

        // Very High Risk: Age >= 60, Abnormal Heart Rate, High BP, High Sugar
        else if (age >= 60) {
            if (heartRate < 60 || heartRate > 100) {
                riskLevel = "Very High"; // Abnormal heart rate
            } else if (bp >= 140) {
                riskLevel = "Very High"; // High BP
            } else if (sugar >= 126) {
                riskLevel = "Very High"; // High sugar
            }
        }

        // Set final risk result
        if (riskLevel === "Very High") {
            setRiskResult("The risk of heart failure is: Very High. Immediate medical attention is recommended.");
        } else if (riskLevel === "High") {
            setRiskResult("The risk of heart failure is: High. Lifestyle changes and regular health checkups are recommended.");
        } else if (riskLevel === "Medium") {
            setRiskResult("The risk of heart failure is: Medium. Monitor health and adopt a healthier lifestyle.");
        } else {
            setRiskResult("The risk of heart failure is: Low. Keep maintaining a healthy lifestyle.");
        }
    };

    return (
        <div className="card">
            <h2>Heart Failure Risk Measurer</h2>
            <form onSubmit={handleRiskPrediction}>
                <div className="form-group">
                    <label htmlFor="gender">Gender *</label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={errors.gender ? "error" : ""}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <small className="error-message">{errors.gender}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="age">Age *</label>
                    <input
                        type="text"
                        id="age"
                        name="age"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={handleChange}
                        className={errors.age ? "error" : ""}
                    />
                    {errors.age && <small className="error-message">{errors.age}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="heartRate">Heart Rate (bpm) *</label>
                    <input
                        type="number"
                        id="heartRate"
                        name="heartRate"
                        placeholder="Enter heart rate"
                        value={formData.heartRate}
                        onChange={handleChange}
                        className={errors.heartRate ? "error" : ""}
                    />
                    {errors.heartRate && <small className="error-message">{errors.heartRate}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="bp">Blood Pressure (mm Hg) *</label>
                    <input
                        type="number"
                        id="bp"
                        name="bp"
                        placeholder="Enter blood pressure"
                        value={formData.bp}
                        onChange={handleChange}
                        className={errors.bp ? "error" : ""}
                    />
                    {errors.bp && <small className="error-message">{errors.bp}</small>}
                </div>

                <div className="form-group">
                    <label htmlFor="sugarLevel">Sugar Level (mg/dL) *</label>
                    <input
                        type="number"
                        id="sugarLevel"
                        name="sugarLevel"
                        placeholder="Enter sugar level"
                        value={formData.sugarLevel}
                        onChange={handleChange}
                        className={errors.sugarLevel ? "error" : ""}
                    />
                    {errors.sugarLevel && <small className="error-message">{errors.sugarLevel}</small>}
                </div>

                <button type="submit" className="submit-btn">
                    Predict Risk
                </button>
            </form>

            {riskResult && <div className="risk-result"><p>{riskResult}</p></div>}
        </div>
    );
}

function App() {
    const [advancedFormData, setAdvancedFormData] = useState({
        gender: '',
        ageMin: '',
        ageMax: '',
        cholesterolMin: '',
        cholesterolMax: ''
    });

    const [quickSearchQuery, setQuickSearchQuery] = useState('');
    const [advancedResults, setAdvancedResults] = useState([]);
    const [quickResults, setQuickResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAdvancedInputChange = (e) => {
        const { name, value } = e.target;
        setAdvancedFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdvancedSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { gender, ageMin, ageMax, cholesterolMin, cholesterolMax } = advancedFormData;
            const payload = { gender };
            if (ageMin) payload.ageMin = ageMin;
            if (ageMax) payload.ageMax = ageMax;
            if (cholesterolMin) payload.cholesterolMin = cholesterolMin;
            if (cholesterolMax) payload.cholesterolMax = cholesterolMax;

            const response = await fetch('http://localhost:4000/advanced-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();

            if (response.ok) {
                setAdvancedResults(data.data);
            } else {
                setError(data.message || 'Error occurred while performing advanced search');
            }
        } catch (err) {
            setError('Unable to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSearchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:4000/quick-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query: quickSearchQuery })
            });
            const data = await response.json();

            if (response.ok) {
                setQuickResults(data.data);
            } else {
                setError(data.message || 'Error occurred while performing quick search');
            }
        } catch (err) {
            setError('Unable to connect to the server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <h1>Health Risk Prediction</h1>

            {/* Advanced Search */}
            <div className="card">
                <h2>Advanced Search</h2>
                <form onSubmit={handleAdvancedSearchSubmit}>
                    <div className="form-group">
                        <label htmlFor="gender">Gender *</label>
                        <select
                            id="gender"
                            name="gender"
                            value={advancedFormData.gender}
                            onChange={handleAdvancedInputChange}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Age Range </label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="ageMin"
                                placeholder="Min"
                                value={advancedFormData.ageMin}
                                onChange={handleAdvancedInputChange}
                            />
                            <input
                                type="number"
                                name="ageMax"
                                placeholder="Max"
                                value={advancedFormData.ageMax}
                                onChange={handleAdvancedInputChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Cholesterol Range </label>
                        <div className="range-inputs">
                            <input
                                type="number"
                                name="cholesterolMin"
                                placeholder="Min"
                                value={advancedFormData.cholesterolMin}
                                onChange={handleAdvancedInputChange}
                            />
                            <input
                                type="number"
                                name="cholesterolMax"
                                placeholder="Max"
                                value={advancedFormData.cholesterolMax}
                                onChange={handleAdvancedInputChange}
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn">
                        Search
                    </button>
                </form>
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {advancedResults.length > 0 && (
                    <div className="results">
                        <h3>Advanced Search Results</h3>
                        {advancedResults.map((result, index) => (
                            <div key={index} className="result-item">
                                <p><strong>Gender:</strong> {result.Gender}</p>
                                <p><strong>Age:</strong> {result.Age}</p>
                                <p><strong>Cholesterol:</strong> {result.Cholesterol}</p>
                                <p><strong>Heart Disease:</strong> {result.HeartDisease}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Search */}
            <div className="card">
                <h2>Quick Search</h2>
                <form onSubmit={handleQuickSearchSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter search query..."
                            value={quickSearchQuery}
                            onChange={(e) => setQuickSearchQuery(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-btn">Search</button>
                </form>
                {loading && <p>Loading...</p>}
                {error && <p className="error">{error}</p>}
                {quickResults.length > 0 && (
                    <div className="results">
                        <h3>Quick Search Results</h3>
                        {quickResults.map((result, index) => (
                            <div key={index} className="result-item">
                                <p><strong>Gender:</strong> {result.Gender}</p>
                                <p><strong>Age:</strong> {result.Age}</p>
                                <p><strong>Cholesterol:</strong> {result.Cholesterol}</p>
                                <p><strong>Heart Disease:</strong> {result.HeartDisease}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Heart Failure Risk Measurer */}
            <HeartFailureRiskMeasurer />
        </div>
    );
}

export default App;