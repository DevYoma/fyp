// App.js
import { useState } from 'react';
import './App.css';
import DiagnosticForm from './components/DiagnosticForm';
import ResultsDisplay from './components/ResultsDisplay';
import PatientHistory from './components/PatientHistory';

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

function App() {
  const [currentView, setCurrentView] = useState('form');
  const [lastResult, setLastResult] = useState<DiagnosisResult | null>(null);

  return (
    <div className="App">
      <header className="app-header">
        <h1>SCA Diagnostic System</h1>
        <p>Significant Bacteriuria Detection in Children with Sickle Cell Anaemia</p>
      </header>
      
      <nav className="nav-tabs">
        <button 
          onClick={() => setCurrentView('form')}
          className={currentView === 'form' ? 'active' : ''}
        >
          New Diagnosis
        </button>
        <button 
          onClick={() => setCurrentView('history')}
          className={currentView === 'history' ? 'active' : ''}
        >
          Patient History
        </button>
      </nav>

      <main>
        {currentView === 'form' && (
          <DiagnosticForm 
            onResult={(result: DiagnosisResult) => {
              setLastResult(result);
              setCurrentView('result');
            }} 
          />
        )}
        {currentView === 'result' && (
          <ResultsDisplay 
            result={lastResult}
            onNewDiagnosis={() => setCurrentView('form')}
          />
        )}
        {currentView === 'history' && <PatientHistory />}
      </main>
    </div>
  );
}

export default App;