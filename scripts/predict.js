const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Inicializar cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para obtener resultados históricos
async function getHistoricalResults(lotteryId, gameType, limit = 30) {
  // Primero intentar obtener resultados específicos del tipo de juego
  let { data, error } = await supabase
    .from('lottery_results')
    .select('*')
    .eq('lottery_id', lotteryId)
    .eq('game_type', gameType)
    .order('draw_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error obteniendo resultados históricos:', error);
    return [];
  }

  // Si no hay resultados específicos, obtener todos los de la lotería
  if (!data || data.length === 0) {
    console.log(`No hay resultados específicos para ${gameType}, usando todos los resultados de la lotería...`);
    const { data: allData, error: allError } = await supabase
      .from('lottery_results')
      .select('*')
      .eq('lottery_id', lotteryId)
      .order('draw_date', { ascending: false })
      .limit(limit);

    if (allError) {
      console.error('Error obteniendo todos los resultados:', allError);
      return [];
    }

    data = allData;
  }

  // Filtrar resultados que no tienen números
  return data.filter(result => result.numbers && result.numbers.length > 0);
}

// Función para analizar frecuencia de números
function analyzeNumberFrequency(results) {
  const frequency = {};
  let totalNumbers = 0;
  
  results.forEach(result => {
    if (Array.isArray(result.numbers)) {
      result.numbers.forEach(num => {
        if (num !== null && num !== undefined) {
          frequency[num] = (frequency[num] || 0) + 1;
          totalNumbers++;
        }
      });
    }
  });

  // Ordenar por frecuencia
  return {
    frequency: Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .reduce((r, [k, v]) => ({ ...r, [k]: v }), {}),
    totalNumbers
  };
}

// Función para generar predicción
function generatePrediction(frequency, numCount) {
  const numbers = Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, numCount * 2) // Tomar el doble de números para tener más opciones
    .map(([num]) => parseInt(num, 10));

  // Si no hay suficientes números, generar aleatorios
  if (numbers.length < numCount) {
    const maxNumber = Math.max(...numbers, 99);
    while (numbers.length < numCount) {
      const randomNum = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(randomNum)) {
        numbers.push(randomNum);
      }
    }
  }

  // Mezclar los números y tomar los primeros numCount
  return numbers
    .sort(() => Math.random() - 0.5)
    .slice(0, numCount);
}

// Función para calcular score de confianza
function calculateConfidenceScore(frequency, prediction, totalNumbers) {
  if (totalNumbers === 0) return 0.5; // Valor por defecto si no hay datos

  const avgFrequency = totalNumbers / Object.keys(frequency).length;
  if (avgFrequency === 0) return 0.5;

  const predictionScore = prediction.reduce((score, num) => {
    return score + (frequency[num] || 0) / avgFrequency;
  }, 0) / prediction.length;

  return Math.min(Math.max(predictionScore, 0), 1);
}

// Función principal de predicción
async function predictNumbers(lotteryId, gameType) {
  try {
    console.log(`Generando predicción para ${gameType}...`);
    
    // Obtener resultados históricos
    const results = await getHistoricalResults(lotteryId, gameType);
    if (results.length === 0) {
      console.log('No hay suficientes datos históricos para generar predicción');
      return null;
    }

    // Analizar frecuencia de números
    const { frequency, totalNumbers } = analyzeNumberFrequency(results);
    
    // Determinar cantidad de números según el tipo de juego
    let numCount;
    switch(gameType) {
      case 'Pega 3':
        numCount = 3;
        break;
      case 'Pega 4 Real':
        numCount = 4;
        break;
      case 'Loto Pool':
        numCount = 5;
        break;
      case 'Mega Lotto':
        numCount = 6;
        break;
      default:
        numCount = 3;
    }

    // Generar predicción
    const prediction = generatePrediction(frequency, numCount);
    
    // Calcular confianza
    const confidence = calculateConfidenceScore(frequency, prediction, totalNumbers);
    
    // Guardar predicción en la base de datos
    const { data, error } = await supabase
      .from('predictions')
      .insert([{
        lottery_id: lotteryId,
        prediction_date: new Date().toISOString().split('T')[0],
        numbers: prediction,
        confidence: confidence
      }])
      .select();

    if (error) {
      console.error('Error guardando predicción:', error);
    } else {
      console.log('Predicción guardada:', data);
    }

    return {
      gameType,
      prediction,
      frequency,
      historicalResults: results.length,
      confidence
    };
  } catch (error) {
    console.error('Error en predicción:', error);
    return null;
  }
}

// Función para predecir todos los juegos
async function predictAllGames() {
  const lotteries = [
    { id: 'c9daee22-2a7d-4c91-8965-71e97aa700ac', name: 'Loteka' },
    { id: '3c0aaf6a-e24a-466e-b2c2-0f312182c286', name: 'Leidsa' },
    { id: 'd4c2ee05-8f00-4365-9b2c-80699341862a', name: 'Nacional' },
    { id: '15bfbeb3-b596-448e-81b4-d5f0c3e46175', name: 'La Primera' },
    { id: '943a56c2-86b3-4f15-938e-5ee68e49b9d6', name: 'Real' }
  ];

  const gameTypes = [
    'Pega 3',
    'Pega 4 Real',
    'Loto Pool',
    'Mega Lotto',
    'Quiniela Loteka',
    'Quiniela Leidsa',
    'Quiniela Nacional',
    'Quiniela La Primera',
    'Quiniela Real'
  ];

  for (const lottery of lotteries) {
    console.log(`\nGenerando predicciones para ${lottery.name}...`);
    
    for (const gameType of gameTypes) {
      const prediction = await predictNumbers(lottery.id, gameType);
      if (prediction) {
        console.log(`\nPredicción para ${gameType}:`);
        console.log(`Números: ${prediction.prediction.join(', ')}`);
        console.log(`Confianza: ${(prediction.confidence * 100).toFixed(2)}%`);
        console.log(`Basado en ${prediction.historicalResults} resultados históricos`);
      }
    }
  }
}

// Ejecutar predicciones
predictAllGames().catch(console.error); 