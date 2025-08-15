// components/DiagnosticForm.js
import { useState } from 'react';
import axios from 'axios';

const DiagnosticForm = ({ onResult }: { onResult: (result: any) => void }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_id: '',
    age: '',
    gender: 'Male',
    leukocyte_count: '',
    nitrite: false,
    protein: '',
    bacterial_count: '',
    ph: '',
    specific_gravity: ''
  });
  const [loading, setLoading] = useState(false);

  // @ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/diagnose', {
        ...formData,
        age: parseInt(formData.age),
        leukocyte_count: parseFloat(formData.leukocyte_count),
        protein: parseFloat(formData.protein),
        bacterial_count: parseFloat(formData.bacterial_count),
        ph: parseFloat(formData.ph),
        specific_gravity: parseFloat(formData.specific_gravity)
      });
      
      onResult(response.data);
    } catch (error) {
      // @ts-ignore
      alert('Error processing diagnosis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diagnostic-form">
      <h2>Enter Patient Data</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Patient Information</h3>
          <input
            type="text"
            placeholder="Patient Name"
            value={formData.patient_name}
            onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Patient ID"
            value={formData.patient_id}
            onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Age (0-18)"
            min="0"
            max="18"
            value={formData.age}
            onChange={(e) => setFormData({...formData, age: e.target.value})}
            required
          />
          <select
            value={formData.gender}
            onChange={(e) => setFormData({...formData, gender: e.target.value})}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className="form-section">
          <h3>Urine Test Results</h3>
          <input
            type="number"
            step="0.1"
            placeholder="Leukocyte Count (cells/hpf)"
            value={formData.leukocyte_count}
            onChange={(e) => setFormData({...formData, leukocyte_count: e.target.value})}
            required
          />
          <label>
            <input
              type="checkbox"
              checked={formData.nitrite}
              onChange={(e) => setFormData({...formData, nitrite: e.target.checked})}
            />
            Nitrite Positive
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="Protein (mg/dL)"
            value={formData.protein}
            onChange={(e) => setFormData({...formData, protein: e.target.value})}
            required
          />
          <input
            type="number"
            placeholder="Bacterial Count (CFU/mL)"
            value={formData.bacterial_count}
            onChange={(e) => setFormData({...formData, bacterial_count: e.target.value})}
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="pH Level"
            min="4.5"
            max="9.0"
            value={formData.ph}
            onChange={(e) => setFormData({...formData, ph: e.target.value})}
            required
          />
          <input
            type="number"
            step="0.001"
            placeholder="Specific Gravity"
            value={formData.specific_gravity}
            onChange={(e) => setFormData({...formData, specific_gravity: e.target.value})}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="diagnose-btn">
          {loading ? 'Processing...' : 'Run Diagnosis'}
        </button>
      </form>
    </div>
  );
};

export default DiagnosticForm;