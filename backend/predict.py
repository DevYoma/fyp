# predict.py - Python script for model predictions
import sys
import json
import joblib
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def main():
    try:
        # Get input data from command line argument
        input_json = sys.argv[1]
        data = json.loads(input_json)
        
        # Load trained model and scaler
        model = joblib.load('realistic_sb_model.pkl')
        scaler = joblib.load('realistic_scaler.pkl')
        
        # Prepare features array
        features = np.array([[
            data['age'],
            data['gender'],
            data['leukocyte_count'],
            data['nitrite'],
            data['protein'],
            data['bacterial_count'],
            data['ph'],
            data['specific_gravity']
        ]])
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]
        
        # Prepare result
        result = {
            'diagnosis': 'SB Detected' if prediction == 1 else 'SB Not Detected',
            'confidence': float(max(probability)),
            'probability_no_sb': float(probability[0]),
            'probability_sb': float(probability[1])
        }
        
        # Output JSON result
        print(json.dumps(result))
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'diagnosis': 'Error',
            'confidence': 0.0
        }
        print(json.dumps(error_result))
        sys.exit(1)

if __name__ == '__main__':
    main()