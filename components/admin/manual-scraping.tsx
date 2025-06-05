"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Clock, Loader2, Play } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/utils/supabase/client';

interface Lottery {
  id: string;
  name: string;
}

interface ScrapingLog {
  id: number;
  lottery_id: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message: string;
  details: string;
  created_at: string;
}

const ManualScraping = () => {
  const [selectedLottery, setSelectedLottery] = useState('all');
  const [isScrapingRunning, setIsScrapingRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [lotteries, setLotteries] = useState<Lottery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotteries = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('lotteries')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching lotteries:', error);
        return;
      }

      if (data) {
        const typedData: Lottery[] = data.map((item: { id: any; name: any }) => ({
          id: String(item.id),
          name: String(item.name)
        }));
        setLotteries(typedData);
      }
      setLoading(false);
    };

    fetchLotteries();
  }, []);
  
  const handleStartScraping = async () => {
    setIsScrapingRunning(true);
    setProgress(0);
    setLogMessages([]);
    
    const supabase = createClient();
    const targetLotteries = selectedLottery === 'all' 
      ? lotteries.map(l => l.id) 
      : [selectedLottery];
    
    // Add initial log message
    setLogMessages(prev => [
      ...prev, 
      `[${new Date().toLocaleTimeString()}] Iniciando scraping para: ${targetLotteries.join(', ')}`
    ]);
    
    // Create initial log entry for each lottery
    const logEntries: ScrapingLog[] = [];
    for (const lotteryId of targetLotteries) {
      try {
        const { data: logEntry, error: logError } = await supabase
          .from('scraping_logs')
          .insert({
            lottery_id: lotteryId,
            status: 'running',
            message: 'Iniciando proceso de scraping',
            details: JSON.stringify({ targetLotteries })
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating log entry:', logError);
          setLogMessages(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Error al crear entrada de log para ${lotteryId}: ${logError.message}`
          ]);
          continue;
        }

        if (logEntry) {
          logEntries.push(logEntry as ScrapingLog);
        }
      } catch (error) {
        console.error('Error in log creation:', error);
        setLogMessages(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Error inesperado al crear log para ${lotteryId}`
        ]);
      }
    }

    if (logEntries.length === 0) {
      setLogMessages(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] No se pudo crear ningún registro de log. Abortando proceso.`
      ]);
      setIsScrapingRunning(false);
      return;
    }

    // Simulate progress updates
    const totalSteps = targetLotteries.length * 3; // 3 steps per lottery
    let currentStep = 0;
    
    const interval = setInterval(async () => {
      currentStep++;
      const newProgress = Math.round((currentStep / totalSteps) * 100);
      setProgress(newProgress);
      
      // Add log messages based on current step
      const lotteryIndex = Math.floor((currentStep - 1) / 3);
      const stepIndex = (currentStep - 1) % 3;
      
      if (lotteryIndex < targetLotteries.length) {
        const lotteryId = targetLotteries[lotteryIndex];
        const logEntry = logEntries[lotteryIndex];
        
        if (!logEntry) {
          console.error('Log entry not found for lottery:', lotteryId);
          return;
        }

        const lotteryName = lotteries.find(l => l.id === lotteryId)?.name || lotteryId;
        const stepMessages = [
          `[${new Date().toLocaleTimeString()}] Conectando con la página de ${lotteryName}...`,
          `[${new Date().toLocaleTimeString()}] Extrayendo resultados de ${lotteryName}...`,
          `[${new Date().toLocaleTimeString()}] Guardando resultados de ${lotteryName} en la base de datos...`
        ];
        
        const message = stepMessages[stepIndex];
        setLogMessages(prev => [...prev, message]);

        try {
          // Update log entry with current step
          await supabase
            .from('scraping_logs')
            .update({
              message,
              details: JSON.stringify({
                step: currentStep,
                totalSteps,
                lotteryId,
                progress: newProgress
              })
            })
            .eq('id', logEntry.id);
        } catch (error) {
          console.error('Error updating log entry:', error);
          setLogMessages(prev => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] Error al actualizar log: ${error}`
          ]);
        }
      }
      
      // Complete process
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        const completionMessage = `[${new Date().toLocaleTimeString()}] Proceso de scraping completado exitosamente.`;
        setLogMessages(prev => [...prev, completionMessage]);

        // Update all log entries with completion
        for (const logEntry of logEntries) {
          try {
            await supabase
              .from('scraping_logs')
              .update({
                status: 'completed',
                message: completionMessage,
                details: JSON.stringify({
                  completed: true,
                  totalSteps,
                  progress: 100
                })
              })
              .eq('id', logEntry.id);
          } catch (error) {
            console.error('Error updating final log status:', error);
            setLogMessages(prev => [
              ...prev,
              `[${new Date().toLocaleTimeString()}] Error al actualizar estado final del log: ${error}`
            ]);
          }
        }

        setIsScrapingRunning(false);
      }
    }, 800);
    
    return () => clearInterval(interval);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Seleccionar Lotería</label>
            <Select 
              value={selectedLottery} 
              onValueChange={setSelectedLottery}
              disabled={isScrapingRunning || loading}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar lotería"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las loterías</SelectItem>
                {lotteries.map(lottery => (
                  <SelectItem key={lottery.id} value={lottery.id}>
                    {lottery.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Opciones Adicionales</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="force" disabled={isScrapingRunning} />
                <label
                  htmlFor="force"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Forzar actualización (ignorar caché)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="save" disabled={isScrapingRunning} />
                <label
                  htmlFor="save"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Guardar capturas de pantalla
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="verbose" disabled={isScrapingRunning} />
                <label
                  htmlFor="verbose"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Modo verbose (logs detallados)
                </label>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleStartScraping} 
            disabled={isScrapingRunning || loading}
            className="bg-primary hover:bg-primary/90"
          >
            {isScrapingRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ejecutando...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Iniciar Scraping
              </>
            )}
          </Button>
        </div>
        
        <div className="flex-1 min-w-0">
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Recordatorio</AlertTitle>
            <AlertDescription>
              El scraping automático está programado para ejecutarse cada hora. 
              Sólo use esta función si necesita actualizar los datos inmediatamente.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
      {isScrapingRunning && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progreso del Scraping</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div>
        <h3 className="text-sm font-medium mb-2">Logs de Ejecución</h3>
        <Card>
          <CardContent className="p-4">
            <div className="bg-muted p-4 rounded-md h-[300px] overflow-y-auto font-mono text-xs">
              {logMessages.length > 0 ? (
                logMessages.map((message, index) => (
                  <div key={index} className="mb-1">
                    {message}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground">
                  Los logs aparecerán aquí al iniciar el proceso de scraping...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualScraping;