"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wand2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lottery {
  id: string;
  name: string;
}

interface PredictionType {
  id: string;
  name: string;
}

const PredictionGenerator = () => {
  const [selectedLottery, setSelectedLottery] = useState<string>('');
  const [selectedPredictionType, setSelectedPredictionType] = useState<string>('');
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [predictionTypes, setPredictionTypes] = useState<PredictionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);

  const fetchLotteries = async () => {
    try {
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .order('name');

      if (error) throw error;
      setLotteries(data || []);
    } catch (err) {
      setError('Error al cargar las loterías');
    }
  };

  const fetchPredictionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('prediction_types')
        .select('*')
        .order('name');

      if (error) throw error;
      setPredictionTypes(data || []);
    } catch (err) {
      setError('Error al cargar los tipos de predicción');
    }
  };

  // Cargar loterías y tipos de predicción al montar el componente
  useEffect(() => {
    fetchLotteries();
    fetchPredictionTypes();
  }, []);

  const generatePrediction = async () => {
    if (!selectedLottery || !selectedPredictionType) {
      setError('Por favor selecciona una lotería y un tipo de predicción');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setGeneratedNumbers([]);

    try {
      const selectedType = predictionTypes.find(pt => pt.id === selectedPredictionType);
      if (!selectedType) {
        setError('No se encontró el tipo de predicción seleccionado');
        return;
      }

      let numbers: number[] = [];
      let confidence = 0.8;

      // Generar números según el tipo de predicción
      switch (selectedType.name) {
        case 'punto':
          // Un solo número entre 1 y 90
          numbers = [Math.floor(Math.random() * 90) + 1];
          break;
        case 'pale':
          // Dos números diferentes entre 1 y 90
          const num1 = Math.floor(Math.random() * 90) + 1;
          let num2;
          do {
            num2 = Math.floor(Math.random() * 90) + 1;
          } while (num2 === num1);
          numbers = [num1, num2];
          break;
        case 'tripleta':
          // Tres números diferentes entre 1 y 90
          const n1 = Math.floor(Math.random() * 90) + 1;
          let n2, n3;
          do {
            n2 = Math.floor(Math.random() * 90) + 1;
          } while (n2 === n1);
          do {
            n3 = Math.floor(Math.random() * 90) + 1;
          } while (n3 === n1 || n3 === n2);
          numbers = [n1, n2, n3];
          break;
        default:
          setError('Tipo de predicción no válido');
          return;
      }

      // Mostrar los números generados inmediatamente
      setGeneratedNumbers(numbers);

      // Crear la predicción base
      const { data: prediction, error: predictionError } = await supabase
        .from('predictions')
        .insert({
          lottery_id: selectedLottery,
          prediction_type_id: selectedType.id,
          numbers: numbers,
          confidence: confidence,
          predicted_for_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (predictionError) {
        console.error('Error al crear la predicción:', predictionError);
        setError('No se pudo guardar la predicción. Por favor, intenta de nuevo.');
        return;
      }

      if (!prediction) {
        setError('No se pudo crear la predicción. Por favor, intenta de nuevo.');
        return;
      }

      // Crear el registro específico según el tipo
      const { error: specificError } = await supabase
        .from('points_pale_predictions')
        .insert({
          prediction_id: prediction.id,
          type: selectedType.name,
          numbers: numbers,
          confidence: confidence
        });

      if (specificError) {
        console.error('Error al crear el registro específico:', specificError);
        setError('No se pudo guardar los detalles de la predicción. Por favor, intenta de nuevo.');
        return;
      }

      setSuccess('¡Predicción generada con éxito!');
    } catch (error) {
      console.error('Error al generar la predicción:', error);
      setError('Ocurrió un error al generar la predicción. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Generador de Predicciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lotería</label>
              <Select value={selectedLottery} onValueChange={setSelectedLottery}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una lotería" />
                </SelectTrigger>
                <SelectContent>
                  {lotteries.map((lottery) => (
                    <SelectItem key={lottery.id} value={lottery.id}>
                      {lottery.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Predicción</label>
              <Select value={selectedPredictionType} onValueChange={setSelectedPredictionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {predictionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <AlertDescription className="text-sm text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {generatedNumbers.length > 0 && (
            <div className="p-4 bg-muted rounded-lg mt-4">
              <h3 className="font-medium mb-2 text-sm">Números Generados:</h3>
              <div className="flex gap-2">
                {generatedNumbers.map((num, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground rounded-full font-bold"
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            className="w-full mt-4" 
            onClick={generatePrediction}
            disabled={loading || !selectedLottery || !selectedPredictionType}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generar Predicción
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionGenerator; 