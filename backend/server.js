// server.js - Express Backend for SCA Diagnostic System
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
let diagnoses = [];

// Helper function to call Python prediction script
function callPythonPredict(inputData) {
    return new Promise((resolve, reject) => {
        // Use 'py' command for Windows Python launcher
        const pythonProcess = spawn('py', [
            path.join(__dirname, 'predict.py'),
            JSON.stringify(inputData)
        ]);
        
        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const prediction = JSON.parse(result.trim());
                    resolve(prediction);
                } catch (parseError) {
                    reject(new Error('Failed to parse Python output'));
                }
            } else {
                reject(new Error(`Python script failed: ${error}`));
            }
        });
    });
}

// Helper function for recommendations
function getRecommendations(prediction, data) {
    if (prediction.diagnosis === 'SB Detected') {
        return [
            "Immediate urine culture recommended",
            "Consider antibiotic therapy",
            "Monitor kidney function closely",
            "Increase fluid intake",
            "Follow-up in 48-72 hours"
        ];
    } else {
        return [
            "Continue routine monitoring",
            "Maintain adequate hydration",
            "Regular follow-up as scheduled"
        ];
    }
}

// Routes
app.post('/api/diagnose', async (req, res) => {
    try {
        const data = req.body;
        
        // Validate required fields
        const requiredFields = ['age', 'gender', 'leukocyte_count', 'protein', 
                               'bacterial_count', 'ph', 'specific_gravity'];
        
        for (const field of requiredFields) {
            if (data[field] === undefined || data[field] === null) {
                return res.status(400).json({ 
                    error: `Missing required field: ${field}` 
                });
            }
        }

        // Prepare data for Python script
        const inputData = {
            age: parseInt(data.age),
            gender: data.gender === 'Male' ? 1 : 0,
            leukocyte_count: parseFloat(data.leukocyte_count),
            nitrite: data.nitrite ? 1 : 0,
            protein: parseFloat(data.protein),
            bacterial_count: parseFloat(data.bacterial_count),
            ph: parseFloat(data.ph),
            specific_gravity: parseFloat(data.specific_gravity)
        };

        // Call Python prediction
        const prediction = await callPythonPredict(inputData);
        
        // Prepare result
        const result = {
            patient_id: data.patient_id || 'N/A',
            patient_name: data.patient_name || 'N/A',
            diagnosis: prediction.diagnosis,
            confidence: prediction.confidence,
            risk_level: prediction.diagnosis === 'SB Detected' ? 'High' : 'Low',
            timestamp: new Date().toISOString(),
            recommendations: getRecommendations(prediction, data),
            input_data: data // Store original input for analysis
        };
        
        // Store diagnosis
        diagnoses.push(result);
        
        res.json(result);
        
    } catch (error) {
        console.error('Diagnosis error:', error);
        res.status(500).json({ 
            error: 'Internal server error during diagnosis',
            details: error.message 
        });
    }
});

app.get('/api/patients', (req, res) => {
    try {
        res.json({
            total: diagnoses.length,
            diagnoses: diagnoses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/patients/:id', (req, res) => {
    try {
        const patientId = req.params.id;
        const patient = diagnoses.find(diagnosis => diagnosis.patient_id === patientId);
        
        if (patient) {
            res.json(patient);
        } else {
            res.status(404).json({ 
                error: 'Patient not found',
                message: `No diagnosis found for patient ID: ${patientId}`
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
    


app.get('/api/stats', (req, res) => {
    try {
        const totalDiagnoses = diagnoses.length;
        const sbDetected = diagnoses.filter(d => d.diagnosis === 'SB Detected').length;
        const sbNotDetected = totalDiagnoses - sbDetected;
        
        res.json({
            total_diagnoses: totalDiagnoses,
            sb_detected: sbDetected,
            sb_not_detected: sbNotDetected,
            sb_detection_rate: totalDiagnoses > 0 ? (sbDetected / totalDiagnoses * 100).toFixed(1) : 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/patients/:index', (req, res) => {
    try {
        const index = parseInt(req.params.index);
        if (index >= 0 && index < diagnoses.length) {
            const deleted = diagnoses.splice(index, 1);
            res.json({ 
                message: 'Diagnosis deleted successfully',
                deleted: deleted[0]
            });
        } else {
            res.status(404).json({ error: 'Diagnosis not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        total_diagnoses: diagnoses.length
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`SCA Diagnostic System Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});