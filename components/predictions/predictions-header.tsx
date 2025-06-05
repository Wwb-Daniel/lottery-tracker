"use client";

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const PredictionsHeader = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Predicciones</h1>
        <p className="text-muted-foreground mt-2">
          Basadas en análisis estadístico de resultados anteriores
        </p>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Importante</AlertTitle>
        <AlertDescription>
          Las predicciones se basan en análisis estadístico y no garantizan resultados. 
          Juegue con responsabilidad y considere estas predicciones solo como referencia.
        </AlertDescription>
      </Alert>
    </section>
  );
};

export default PredictionsHeader;