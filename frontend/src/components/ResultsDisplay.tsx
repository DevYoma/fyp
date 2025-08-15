import React from 'react';
import './ResultsDisplay.css';

interface DiagnosisResult {
  patient_id: string;
  patient_name: string;
  diagnosis: string;
  confidence: number;
  risk_level: string;
  timestamp: string;
  recommendations: string[];
  input_data: any;
}

interface ResultsDisplayProps {
  result: DiagnosisResult | null;
  onNewDiagnosis: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, onNewDiagnosis }) => {
  if (!result) {
    return (
      <div className="results-container">
        <div className="no-result">
          <h2>No Results Available</h2>
          <p>Please perform a diagnosis first.</p>
          <button onClick={onNewDiagnosis} className="btn-primary">
            Start New Diagnosis
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRiskColor = (riskLevel: string) => {
    return riskLevel === 'High' ? '#dc3545' : '#28a745';
  };

  const getDiagnosisColor = (diagnosis: string) => {
    return diagnosis === 'SB Detected' ? '#dc3545' : '#28a745';
  };

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Diagnosis Results</h2>
        <button onClick={onNewDiagnosis} className="btn-secondary">
          New Diagnosis
        </button>
      </div>

      <div className="results-grid">
        {/* Patient Information */}
        <div className="result-card patient-info">
          <h3>Patient Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Patient ID:</label>
              <span>{result.patient_id}</span>
            </div>
            <div className="info-item">
              <label>Patient Name:</label>
              <span>{result.patient_name}</span>
            </div>
            <div className="info-item">
              <label>Date & Time:</label>
              <span>{formatDate(result.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Diagnosis Result */}
        <div className="result-card diagnosis-result">
          <h3>Diagnosis</h3>
          <div className="diagnosis-content">
            <div 
              className="diagnosis-badge"
              style={{ backgroundColor: getDiagnosisColor(result.diagnosis) }}
            >
              {result.diagnosis}
            </div>
            <div className="confidence-meter">
              <label>Confidence Level:</label>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill"
                  style={{ 
                    width: `${result.confidence}%`,
                    backgroundColor: getDiagnosisColor(result.diagnosis)
                  }}
                ></div>
              </div>
              <span className="confidence-text">{result.confidence}%</span>
            </div>
            <div className="risk-level">
              <label>Risk Level:</label>
              <span 
                className="risk-badge"
                style={{ backgroundColor: getRiskColor(result.risk_level) }}
              >
                {result.risk_level}
              </span>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="result-card recommendations">
          <h3>Recommendations</h3>
          <ul className="recommendations-list">
            {result.recommendations.map((recommendation, index) => (
              <li key={index} className="recommendation-item">
                <span className="recommendation-icon">•</span>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>

        {/* Input Data Summary */}
        <div className="result-card input-summary">
          <h3>Test Parameters</h3>
          <div className="parameters-grid">
            <div className="parameter-item">
              <label>Age:</label>
              <span>{result.input_data.age} years</span>
            </div>
            <div className="parameter-item">
              <label>Gender:</label>
              <span>{result.input_data.gender}</span>
            </div>
            <div className="parameter-item">
              <label>Leukocyte Count:</label>
              <span>{result.input_data.leukocyte_count}</span>
            </div>
            <div className="parameter-item">
              <label>Protein:</label>
              <span>{result.input_data.protein}</span>
            </div>
            <div className="parameter-item">
              <label>Bacterial Count:</label>
              <span>{result.input_data.bacterial_count}</span>
            </div>
            <div className="parameter-item">
              <label>pH:</label>
              <span>{result.input_data.ph}</span>
            </div>
            <div className="parameter-item">
              <label>Specific Gravity:</label>
              <span>{result.input_data.specific_gravity}</span>
            </div>
            <div className="parameter-item">
              <label>Nitrite:</label>
              <span>{result.input_data.nitrite ? 'Positive' : 'Negative'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="results-actions">
        <button onClick={onNewDiagnosis} className="btn-primary">
          Perform Another Diagnosis
        </button>
        <button 
          onClick={() => window.print()} 
          className="btn-secondary"
        >
          Print Results
        </button>
      </div>
    </div>
  );
};

export default ResultsDisplay;
