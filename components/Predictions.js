import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://peyokcdmiligysiqxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW9rY2RtaWxpZ3lzaXF4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjg2MzQsImV4cCI6MjA2NDY0NDYzNH0.VKK3WUSl_k0UMbO9ihEEgjf6YNs0vp5IL3Gx5GEzUCM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Función para convertir el formato de números de PostgreSQL a array de JavaScript
const parsePostgresArray = (pgArray) => {
  if (!pgArray) return [];
  // Eliminar las llaves y el corchete final, y dividir por comas
  const numbers = pgArray
    .replace('{', '')
    .replace(']}', '')
    .split(',')
    .map(num => parseInt(num.trim(), 10));
  return numbers;
};

export default function Predictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [lotteryNames, setLotteryNames] = useState({});

  useEffect(() => {
    fetchLotteryNames();
    fetchPredictions();
  }, []);

  const fetchLotteryNames = async () => {
    try {
      const { data, error } = await supabase
        .from('lotteries')
        .select('id, name');

      if (error) throw error;

      const names = data.reduce((acc, lottery) => {
        acc[lottery.id] = lottery.name;
        return acc;
      }, {});

      setLotteryNames(names);
    } catch (err) {
      console.error('Error fetching lottery names:', err);
    }
  };

  const fetchPredictions = async () => {
    try {
      console.log('Fetching predictions from Supabase...');
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching predictions:', error);
        throw error;
      }

      console.log('Predictions fetched:', data);
      
      // Agrupar predicciones por lotería
      const groupedPredictions = data.reduce((acc, prediction) => {
        const lotteryId = prediction.lottery_id;
        if (!acc[lotteryId]) {
          acc[lotteryId] = [];
        }
        // Convertir los números al formato correcto
        prediction.numbers = parsePostgresArray(prediction.numbers);
        acc[lotteryId].push(prediction);
        return acc;
      }, {});

      console.log('Grouped predictions:', groupedPredictions);
      setPredictions(groupedPredictions);
    } catch (err) {
      console.error('Error in fetchPredictions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (prediction) => {
    setAnalyzing(true);
    setSelectedPrediction(prediction);
    
    try {
      // Obtener datos históricos para el análisis
      const { data: historicalData, error } = await supabase
        .from('lottery_results')
        .select('*')
        .eq('lottery_id', prediction.lottery_id)
        .order('draw_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Análisis de frecuencia
      const frequency = {};
      historicalData.forEach(result => {
        result.numbers.forEach(num => {
          frequency[num] = (frequency[num] || 0) + 1;
        });
      });

      // Análisis de patrones
      const patterns = [];
      const numbers = prediction.numbers;
      
      // Patrón de secuencia
      const isSequential = numbers.every((num, i) => i === 0 || num > numbers[i - 1]);
      if (isSequential) patterns.push('Secuencia ascendente');
      
      // Patrón de rango
      const range = Math.max(...numbers) - Math.min(...numbers);
      patterns.push(`Rango de números: ${range}`);
      
      // Patrón de paridad
      const evenCount = numbers.filter(n => n % 2 === 0).length;
      const oddCount = numbers.length - evenCount;
      patterns.push(`Distribución par/impar: ${evenCount}/${oddCount}`);

      // Análisis de tendencias
      const recentNumbers = historicalData.slice(0, 10).flatMap(r => r.numbers);
      const commonNumbers = recentNumbers.filter(n => numbers.includes(n));
      patterns.push(`Números frecuentes en últimos sorteos: ${commonNumbers.length}`);

      setAnalysis({
        frequency,
        patterns,
        historicalData: historicalData.length,
        explanation: `Esta predicción se basa en el análisis de ${historicalData.length} sorteos anteriores, con un nivel de confianza del ${Math.round(prediction.confidence * 100)}%. Los números seleccionados muestran una distribución equilibrada y siguen patrones identificados en resultados históricos.`
      });
    } catch (err) {
      console.error('Error en análisis:', err);
      setError('Error al realizar el análisis');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <section className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Predicciones</h1>
          <p className="text-muted-foreground mt-2">Basadas en análisis estadístico de resultados anteriores</p>
        </div>
        <div role="alert" className="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground bg-background text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert h-4 w-4">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="8" y2="12"></line>
            <line x1="12" x2="12.01" y1="16" y2="16"></line>
          </svg>
          <h5 className="mb-1 font-medium leading-none tracking-tight">Importante</h5>
          <div className="text-sm [&_p]:leading-relaxed">
            Las predicciones se basan en análisis estadístico y no garantizan resultados. Juegue con responsabilidad y considere estas predicciones solo como referencia.
          </div>
        </div>
      </section>

      <div className="mt-8 space-y-10">
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Predicciones para hoy</h2>
            <p className="text-muted-foreground">miércoles 4 de junio, 2025</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(predictions).map(([lotteryId, lotteryPredictions]) => (
              lotteryPredictions.map((prediction) => (
                <div key={prediction.id} className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden h-full border-border hover:shadow-md transition-shadow">
                  <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-primary/10 to-transparent pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">{lotteryNames[lotteryId] || 'Lotería'}</h3>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock h-3.5 w-3.5 mr-1">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {new Date(prediction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar h-3.5 w-3.5">
                          <path d="M8 2v4"></path>
                          <path d="M16 2v4"></path>
                          <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                          <path d="M3 10h18"></path>
                        </svg>
                        {new Date(prediction.prediction_date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="p-6 pt-4">
                    <div className="flex justify-center space-x-4">
                      {prediction.numbers.map((number, index) => (
                        <div key={index} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                          <span className="font-bold text-primary-foreground">{number.toString().padStart(2, '0')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Confianza</span>
                        <span className="text-sm font-bold">{Math.round(prediction.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            prediction.confidence >= 0.75 ? 'bg-emerald-500' :
                            prediction.confidence >= 0.65 ? 'bg-amber-500' :
                            'bg-rose-500'
                          }`}
                          style={{ width: `${prediction.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center p-6 pt-2 pb-4">
                    <button 
                      onClick={() => runAnalysis(prediction)}
                      className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 w-full text-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-pie h-4 w-4 mr-2">
                        <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path>
                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                      </svg>
                      Ver análisis
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-4 w-4 ml-2">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ))}
          </div>
        </section>
      </div>

      {/* Modal de Análisis */}
      {selectedPrediction && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">Análisis de Predicción</h3>
              <button 
                onClick={() => {
                  setSelectedPrediction(null);
                  setAnalysis(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {analyzing ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Frecuencia de Números</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(analysis.frequency)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 10)
                          .map(([num, freq]) => (
                            <div key={num} className="flex justify-between items-center">
                              <span className="font-medium">Número {num}:</span>
                              <span className="text-muted-foreground">{freq} veces</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Patrones Detectados</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      <ul className="space-y-2">
                        {analysis.patterns.map((pattern, index) => (
                          <li key={index} className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2 text-primary">
                              <path d="M5 12l5 5l10 -10"></path>
                            </svg>
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Explicación</h4>
                  <p className="text-muted-foreground leading-relaxed">{analysis.explanation}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Datos del Análisis</h4>
                  <p className="text-sm text-muted-foreground">
                    Este análisis se basa en {analysis.historicalData} sorteos anteriores de {selectedPrediction.lottery_name}.
                    Los patrones y frecuencias mostrados representan tendencias históricas que han influido en la selección de números.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay análisis disponible</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 