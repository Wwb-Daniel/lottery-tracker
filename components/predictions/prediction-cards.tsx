"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowRight, Calendar, Clock, PieChart, Trophy, Target, Loader2 } from 'lucide-react';
import { Prediction, QuinielaPrediction, PointsPalePrediction } from '@/types/prediction';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PredictionWithRelations {
  id: string;
  lottery_id: string;
  prediction_type_id: string;
  numbers: number[];
  confidence: number;
  predicted_for_date: string;
  created_at: string;
  updated_at: string;
  lotteries: { name: string }[];
  prediction_types: { name: string }[];
  points_pale_predictions?: {
    id: string;
    type: 'punto' | 'pale' | 'tripleta';
    numbers: number[];
    confidence: number;
  }[];
}

const PredictionCards = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('predictions')
        .select(`
          id,
          lottery_id,
          prediction_type_id,
          numbers,
          confidence,
          predicted_for_date,
          created_at,
          updated_at,
          lotteries!fk_lottery (
            name
          ),
          prediction_types!fk_prediction_type (
            name
          ),
          points_pale_predictions!fk_prediction (
            id,
            type,
            numbers,
            confidence
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        console.error('Error al cargar predicciones:', fetchError);
        setError('No se pudieron cargar las predicciones. Por favor, intenta de nuevo.');
        return;
      }

      if (!data) {
        setError('No se encontraron predicciones.');
        return;
      }

      // Transformar los datos para que coincidan con la interfaz
      const transformedData = (data as PredictionWithRelations[]).map(prediction => ({
        id: prediction.id,
        lottery_id: prediction.lottery_id,
        lottery_name: prediction.lotteries?.[0]?.name || 'Lotería desconocida',
        prediction_type_id: prediction.prediction_type_id,
        prediction_type: prediction.prediction_types?.[0]?.name || 'Tipo desconocido',
        numbers: prediction.numbers,
        confidence: prediction.confidence,
        predicted_for_date: prediction.predicted_for_date,
        created_at: prediction.created_at,
        updated_at: prediction.updated_at,
        points_pale_predictions: prediction.points_pale_predictions?.map(ppp => ({
          id: ppp.id,
          prediction_id: prediction.id,
          type: ppp.type,
          numbers: ppp.numbers,
          confidence: ppp.confidence,
          created_at: prediction.created_at,
          updated_at: prediction.updated_at
        }))
      }));

      setPredictions(transformedData);
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Ocurrió un error al cargar las predicciones. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const renderPredictionContent = (prediction: Prediction) => {
    switch (prediction.prediction_type) {
      case 'numbers':
        return (
          <div className="flex justify-center space-x-4">
            {prediction.numbers?.map((num, i) => (
              <div key={i} className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                <span className="font-bold text-primary-foreground">{num.toString().padStart(2, '0')}</span>
              </div>
            ))}
          </div>
        );

      case 'quiniela':
        return (
          <div className="grid grid-cols-3 gap-2">
            {prediction.quiniela_predictions?.map((match: QuinielaPrediction) => (
              <div key={match.id} className="flex flex-col items-center p-2 bg-muted rounded-lg">
                <span className="text-xs text-muted-foreground">Partido {match.match_number}</span>
                <span className="text-lg font-bold">{match.prediction}</span>
                <span className="text-xs text-muted-foreground">{Math.round(match.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        );

      case 'punto':
      case 'pale':
      case 'tripleta':
        return (
          <div className="space-y-4">
            {prediction.points_pale_predictions?.map((pred: PointsPalePrediction) => (
              <div key={pred.id} className="flex flex-col items-center p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {pred.type === 'punto' ? <Target className="h-4 w-4" /> : <Trophy className="h-4 w-4" />}
                  <span className="text-sm font-medium capitalize">{pred.type}</span>
                </div>
                <div className="flex justify-center space-x-2">
                  {pred.numbers.map((num, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
                      <span className="font-bold text-primary-foreground">{num.toString().padStart(2, '0')}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground mt-1">{Math.round(pred.confidence * 100)}%</span>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Tipo de predicción no soportado</div>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            No hay predicciones disponibles.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'bg-emerald-500';
    if (confidence >= 65) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Predicciones para hoy</h2>
        <p className="text-muted-foreground">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {predictions.map((prediction) => (
          <motion.div key={prediction.id} variants={item}>
            <Card className="overflow-hidden h-full border-border hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{prediction.lottery_name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {new Date(prediction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(prediction.predicted_for_date).toLocaleDateString([], { day: '2-digit', month: '2-digit' })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {renderPredictionContent(prediction)}
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Confianza</span>
                    <span className="text-sm font-bold">{Math.round(prediction.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`${getConfidenceColor(prediction.confidence * 100)} h-2 rounded-full`}
                      style={{ width: `${prediction.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* TODO: Implementar análisis */}}
                >
                  <PieChart className="h-4 w-4 mr-2" />
                  Ver análisis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default PredictionCards;