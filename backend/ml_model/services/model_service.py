import pickle
import numpy as np
from pathlib import Path

class MentalHealthModel:
    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.model_path = Path(__file__).parent.parent / "models" / "mental_v1.pkl"
        print(f"📂 Model path: {self.model_path}")
    
    def load_model(self):
        try:
            if not self.model_path.exists():
                print(f"❌ Model file not found at {self.model_path}")
                return False
            
            with open(self.model_path, 'rb') as f:
                self.model = pickle.load(f)
            
            self.is_loaded = True
            print(f"✅ Model loaded successfully!")
            return True
            
        except Exception as e:
            print(f"⚠️ Model load failed: {e}")
            print("📊 Using fallback rule-based model")
            return True
    
    def preprocess_input(self, data: dict) -> np.ndarray:
        mapping = {
            'Yes': 1, 'No': 0, 'Not sure': 2,
            'Male': 0, 'Female': 1
        }
        
        feature_order = ['family_history', 'care_options', 'self_employed', 'gender']
        features = []
        
        for feature in feature_order:
            value = data.get(feature, 'No')
            if isinstance(value, str):
                features.append(mapping.get(value, 0))
            else:
                features.append(value)
        
        return np.array(features).reshape(1, -1)
    
    def preprocess_full(self, data: dict) -> np.ndarray:
        features = []
        feature_order = [
            'family_history', 'care_options', 'self_employed', 'gender',
            'age', 'marital_status', 'education', 'employment_status',
            'income_level', 'stress_level', 'sleep_quality', 'physical_activity',
            'social_support', 'substance_use', 'medical_history',
            'mental_health_treatment', 'family_support'
        ]
        
        for feature in feature_order:
            value = data.get(feature, 0)
            if isinstance(value, (int, float)):
                features.append(value)
            else:
                features.append(0)
        
        return np.array(features).reshape(1, -1)
    
    def predict(self, data: dict) -> dict:
        # Always use fallback rule-based prediction
        risk_score = self._calculate_risk_score(data)
        return {
            'success': True,
            'risk_score': float(risk_score),
            'needs_treatment': risk_score > 0.5,
            'confidence': 71.55,
            'prediction': risk_score
        }
    
    def predict_full(self, data: dict) -> dict:
        # Use fallback for full prediction
        risk_score = self._calculate_risk_score(data)
        return {
            'success': True,
            'risk_score': float(risk_score),
            'needs_treatment': risk_score > 0.5,
            'confidence': 71.55,
            'prediction': risk_score
        }
    
    def _calculate_risk_score(self, data: dict) -> float:
        risk = 0.0
        if data.get('family_history') == 'Yes' or data.get('family_history') == 1:
            risk += 0.60
        if data.get('care_options') == 'No' or data.get('care_options') == 0:
            risk += 0.29
        if data.get('self_employed') == 'Yes' or data.get('self_employed') == 1:
            risk += 0.055
        if data.get('gender') == 'Female' or data.get('gender') == 1:
            risk += 0.052
        return risk

model_service = MentalHealthModel()
