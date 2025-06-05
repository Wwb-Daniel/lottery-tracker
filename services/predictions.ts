import { supabase } from '@/lib/supabase';
import { Prediction, NumberFrequency } from '@/types';

// Generate predictions based on historical data
export async function generatePredictions(lotteryId: string) {
  try {
    // Get historical results for this lottery
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('lottery_id', lotteryId)
      .order('draw_date', { ascending: false })
      .limit(100); // Get last 100 results
    
    if (error) throw new Error(`Error fetching results: ${error.message}`);
    if (!results || results.length === 0) {
      throw new Error('No historical data available for predictions');
    }
    
    // Calculate frequency of each number
    const frequencyMap: Record<number, number> = {};
    
    results.forEach(result => {
      result.numbers.forEach(num => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // Convert to array and sort by frequency
    const frequencyArray: NumberFrequency[] = Object.entries(frequencyMap).map(
      ([number, frequency]) => ({
        number: parseInt(number, 10),
        frequency
      })
    ).sort((a, b) => b.frequency - a.frequency);
    
    // Generate predictions using different methods
    const predictions = [];
    
    // Method 1: Most frequent numbers
    const mostFrequentPrediction = generateMostFrequentPrediction(frequencyArray, 3);
    predictions.push(mostFrequentPrediction);
    
    // Method 2: Mix of frequent and cold numbers
    const mixedPrediction = generateMixedPrediction(frequencyArray, 3);
    predictions.push(mixedPrediction);
    
    // Method 3: Based on recent patterns (for example, numbers that have not appeared recently)
    const recentPatternPrediction = generateRecentPatternPrediction(results, frequencyArray, 3);
    predictions.push(recentPatternPrediction);
    
    // Store predictions in the database
    for (const prediction of predictions) {
      const { error } = await supabase
        .from('predictions')
        .insert({
          lottery_id: lotteryId,
          numbers: prediction.numbers,
          confidence: prediction.confidence,
          predicted_for_date: getTomorrowDate(), // Predict for tomorrow
        });
      
      if (error) {
        console.error('Error storing prediction:', error);
      }
    }
    
    return predictions;
  } catch (error: any) {
    console.error('Error generating predictions:', error);
    throw new Error(`Failed to generate predictions: ${error.message}`);
  }
}

// Helper function to get tomorrow's date in YYYY-MM-DD format
function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

// Generate prediction based on most frequent numbers
function generateMostFrequentPrediction(
  frequencyArray: NumberFrequency[], 
  count: number
): Prediction {
  const numbers = frequencyArray.slice(0, count).map(item => item.number);
  
  // Calculate confidence based on how dominant these numbers are
  const totalOccurrences = frequencyArray.reduce((sum, item) => sum + item.frequency, 0);
  const selectedOccurrences = numbers.reduce(
    (sum, num) => sum + (frequencyArray.find(item => item.number === num)?.frequency || 0), 
    0
  );
  
  const confidence = Math.min(90, Math.round((selectedOccurrences / totalOccurrences) * 100 * 3));
  
  return {
    id: `prediction-${Date.now()}-frequent`,
    lottery_id: '',  // This will be set when storing
    numbers,
    confidence,
    predicted_for_date: getTomorrowDate(),
    created_at: new Date().toISOString()
  };
}

// Generate prediction with a mix of frequent and cold numbers
function generateMixedPrediction(
  frequencyArray: NumberFrequency[], 
  count: number
): Prediction {
  // Take some frequent and some cold numbers
  const hotNumbers = frequencyArray.slice(0, Math.ceil(count / 2)).map(item => item.number);
  const coldNumbers = frequencyArray.slice(-Math.floor(count / 2)).map(item => item.number);
  
  const numbers = [...hotNumbers, ...coldNumbers];
  
  // Mixed predictions have moderate confidence
  const confidence = 65 + Math.floor(Math.random() * 10);
  
  return {
    id: `prediction-${Date.now()}-mixed`,
    lottery_id: '',  // This will be set when storing
    numbers,
    confidence,
    predicted_for_date: getTomorrowDate(),
    created_at: new Date().toISOString()
  };
}

// Generate prediction based on recent patterns
function generateRecentPatternPrediction(
  results: any[], 
  frequencyArray: NumberFrequency[], 
  count: number
): Prediction {
  // Find numbers that haven't appeared in the last few draws but are generally common
  const recentResults = results.slice(0, 5).flatMap(result => result.numbers);
  const recentSet = new Set(recentResults);
  
  const candidateNumbers = frequencyArray
    .filter(item => !recentSet.has(item.number) && item.frequency > 1)
    .slice(0, count * 2)
    .map(item => item.number);
  
  // Select a random subset of these candidates
  const numbers = [];
  while (numbers.length < count && candidateNumbers.length > 0) {
    const randomIndex = Math.floor(Math.random() * candidateNumbers.length);
    numbers.push(candidateNumbers[randomIndex]);
    candidateNumbers.splice(randomIndex, 1);
  }
  
  // Fill in with random frequent numbers if needed
  while (numbers.length < count) {
    const randomIndex = Math.floor(Math.random() * Math.min(10, frequencyArray.length));
    const num = frequencyArray[randomIndex].number;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  
  // Pattern-based predictions have varying confidence
  const confidence = 55 + Math.floor(Math.random() * 20);
  
  return {
    id: `prediction-${Date.now()}-pattern`,
    lottery_id: '',  // This will be set when storing
    numbers,
    confidence,
    predicted_for_date: getTomorrowDate(),
    created_at: new Date().toISOString()
  };
}

// Get predictions for a specific lottery
export async function getLotteryPredictions(lotteryId: string) {
  try {
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('lottery_id', lotteryId)
      .gte('predicted_for_date', new Date().toISOString().split('T')[0]) // Get only future predictions
      .order('confidence', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
}