import React, { useState, useEffect } from 'react';
import './PatientHistory.css';

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

interface PatientHistoryProps {}

const PatientHistory: React.FC<PatientHistoryProps> = () => {
  const [diagnoses, setDiagnoses] = useState<DiagnosisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiagnosis, setFilterDiagnosis] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDiagnoses();
  }, []);

  const fetchDiagnoses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patient data');
      }
      const data = await response.json();
      setDiagnoses(data.diagnoses || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const deleteDiagnosis = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this diagnosis?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${index}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete diagnosis');
      }
      
      // Refresh the list
      fetchDiagnoses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete diagnosis');
    }
  };

  const filteredAndSortedDiagnoses = diagnoses
    .filter(diagnosis => {
      const matchesSearch = 
        diagnosis.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diagnosis.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterDiagnosis === 'all' || 
        diagnosis.diagnosis === filterDiagnosis;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'patient_name':
          comparison = a.patient_name.localeCompare(b.patient_name);
          break;
        case 'diagnosis':
          comparison = a.diagnosis.localeCompare(b.diagnosis);
          break;
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDiagnosisColor = (diagnosis: string) => {
    return diagnosis === 'SB Detected' ? '#dc3545' : '#28a745';
  };

  const getRiskColor = (riskLevel: string) => {
    return riskLevel === 'High' ? '#dc3545' : '#28a745';
  };

  const openDiagnosisModal = (diagnosis: DiagnosisResult) => {
    setSelectedDiagnosis(diagnosis);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDiagnosis(null);
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading patient history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-message">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={fetchDiagnoses} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2>Patient History</h2>
        <div className="header-actions">
          <button onClick={fetchDiagnoses} className="btn-secondary">
            Refresh
          </button>
          <span className="diagnosis-count">
            {filteredAndSortedDiagnoses.length} of {diagnoses.length} diagnoses
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by patient name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filterDiagnosis}
            onChange={(e) => setFilterDiagnosis(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Diagnoses</option>
            <option value="SB Detected">SB Detected</option>
            <option value="SB Not Detected">SB Not Detected</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="timestamp">Date & Time</option>
            <option value="patient_name">Patient Name</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="confidence">Confidence</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-button"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Diagnoses List */}
      <div className="diagnoses-list">
        {filteredAndSortedDiagnoses.length === 0 ? (
          <div className="no-diagnoses">
            <h3>No Diagnoses Found</h3>
            <p>
              {searchTerm || filterDiagnosis !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No patient diagnoses have been recorded yet.'
              }
            </p>
          </div>
        ) : (
          filteredAndSortedDiagnoses.map((diagnosis, index) => (
            <div key={index} className="diagnosis-card">
              <div className="diagnosis-header">
                <div className="patient-info">
                  <h4>{diagnosis.patient_name}</h4>
                  <span className="patient-id">ID: {diagnosis.patient_id}</span>
                  <span className="diagnosis-date">
                    {formatDate(diagnosis.timestamp)}
                  </span>
                </div>
                
                <div className="diagnosis-badges">
                  <span
                    className="diagnosis-badge"
                    style={{ backgroundColor: getDiagnosisColor(diagnosis.diagnosis) }}
                  >
                    {diagnosis.diagnosis}
                  </span>
                  <span
                    className="risk-badge"
                    style={{ backgroundColor: getRiskColor(diagnosis.risk_level) }}
                  >
                    {diagnosis.risk_level} Risk
                  </span>
                </div>
              </div>
              
              <div className="diagnosis-details">
                <div className="confidence-info">
                  <span className="confidence-label">Confidence:</span>
                  {/* <span className="confidence-value">{diagnosis.confidence * 100}%</span> */}
                  <span className="confidence-value">{diagnosis.confidence}%</span>
                </div>
                
                <div className="action-buttons">
                  <button
                    onClick={() => openDiagnosisModal(diagnosis)}
                    className="btn-view"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => deleteDiagnosis(index)}
                    className="btn-delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Detailed View */}
      {showModal && selectedDiagnosis && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Diagnosis Details</h3>
              <button onClick={closeModal} className="modal-close">×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>Patient Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedDiagnosis.patient_name}</span>
                  </div>
                  <div className="detail-item">
                    <label>ID:</label>
                    <span>{selectedDiagnosis.patient_id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedDiagnosis.timestamp)}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Diagnosis Results</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Diagnosis:</label>
                    <span
                      className="diagnosis-badge"
                      style={{ backgroundColor: getDiagnosisColor(selectedDiagnosis.diagnosis) }}
                    >
                      {selectedDiagnosis.diagnosis}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Confidence:</label>
                    <span>{selectedDiagnosis.confidence}%</span>
                  </div>
                  <div className="detail-item">
                    <label>Risk Level:</label>
                    <span
                      className="risk-badge"
                      style={{ backgroundColor: getRiskColor(selectedDiagnosis.risk_level) }}
                    >
                      {selectedDiagnosis.risk_level}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <h4>Recommendations</h4>
                <ul className="recommendations-list">
                  {selectedDiagnosis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="detail-section">
                <h4>Test Parameters</h4>
                <div className="parameters-grid">
                  <div className="parameter-item">
                    <label>Age:</label>
                    <span>{selectedDiagnosis.input_data.age} years</span>
                  </div>
                  <div className="parameter-item">
                    <label>Gender:</label>
                    <span>{selectedDiagnosis.input_data.gender}</span>
                  </div>
                  <div className="parameter-item">
                    <label>Leukocyte Count:</label>
                    <span>{selectedDiagnosis.input_data.leukocyte_count}</span>
                  </div>
                  <div className="parameter-item">
                    <label>Protein:</label>
                    <span>{selectedDiagnosis.input_data.protein}</span>
                  </div>
                  <div className="parameter-item">
                    <label>Bacterial Count:</label>
                    <span>{selectedDiagnosis.input_data.bacterial_count}</span>
                  </div>
                  <div className="parameter-item">
                    <label>pH:</label>
                    <span>{selectedDiagnosis.input_data.ph}</span>
                  </div>
                  <div className="parameter-item">
                    <label>Specific Gravity:</label>
                    <span>{selectedDiagnosis.input_data.specific_gravity}</span>
                  </div>
                  <div className="parameter-item">
                    <label>Nitrite:</label>
                    <span>{selectedDiagnosis.input_data.nitrite ? 'Positive' : 'Negative'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => window.print()} className="btn-primary">
                Print Details
              </button>
              <button onClick={closeModal} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
