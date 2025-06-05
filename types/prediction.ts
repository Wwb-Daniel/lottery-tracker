export interface Prediction {
  id: string;
  lottery_id: string;
  lottery_name: string;
  prediction_type_id: string;
  prediction_type: string;
  numbers: number[];
  confidence: number;
  predicted_for_date: string;
  created_at: string;
  updated_at: string;
  quiniela_predictions?: QuinielaPrediction[];
  points_pale_predictions?: PointsPalePrediction[];
}

export interface QuinielaPrediction {
  id: string;
  prediction_id: string;
  match_number: number;
  prediction: '1' | 'X' | '2';
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface PointsPalePrediction {
  id: string;
  prediction_id: string;
  type: 'punto' | 'pale' | 'tripleta';
  numbers: number[];
  confidence: number;
  created_at: string;
  updated_at: string;
} 