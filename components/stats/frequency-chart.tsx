"use client";

import { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from '@/utils/supabase/client';
import { Button } from "@/components/ui/button";

interface FrequencyData {
  number: number;
  frequency: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

const FrequencyChart = () => {
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [topNumbers, setTopNumbers] = useState<FrequencyData[]>([]);
  const [bottomNumbers, setBottomNumbers] = useState<FrequencyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [period, setPeriod] = useState<'all' | '30days' | '7days'>('30days');

  const fetchFrequencyData = async () => {
    console.log('Iniciando fetchFrequencyData...');
    try {
      const supabase = createClient();
      console.log('Cliente Supabase creado');

      // Verificar conexión
      console.log('Verificando conexión...');
      const { data: testData, error: testError } = await supabase
        .from('lottery_results')
        .select('*')
        .limit(1);

      if (testError) {
        console.error('Error al verificar conexión:', testError);
        throw testError;
      }

      console.log('Conexión verificada, datos de prueba:', testData);

      // Calcular fecha límite según el período seleccionado
      let dateFilter = '';
      if (period !== 'all') {
        const today = new Date();
        const limitDate = new Date();
        if (period === '30days') {
          limitDate.setDate(today.getDate() - 30);
        } else if (period === '7days') {
          limitDate.setDate(today.getDate() - 7);
        }
        dateFilter = limitDate.toISOString();
      }

      // Obtener resultados
      console.log('Obteniendo resultados...');
      const { data, error } = await supabase
        .from('lottery_results')
        .select('*')
        .order('draw_date', { ascending: false })
        .filter('draw_date', period === 'all' ? 'not.is' : 'gte', period === 'all' ? null : dateFilter);

      if (error) {
        console.error('Error al obtener datos:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No se encontraron resultados');
        setError('No se encontraron resultados');
        setIsLoading(false);
        return;
      }

      console.log('Datos recibidos:', data.length, 'registros');
      console.log('Estructura del primer registro:', data[0]);

      // Procesar los números
      const frequencyMap = new Map<number, number>();
      data.forEach((result, index) => {
        console.log(`Procesando registro ${index + 1}:`, result);
        let numbers: number[] = [];
        
        // Intentar extraer números del campo numbers
        if (result.numbers) {
          try {
            if (typeof result.numbers === 'string') {
              numbers = result.numbers.split(',').map(n => parseInt(n.trim()));
            } else if (Array.isArray(result.numbers)) {
              numbers = result.numbers.map(n => typeof n === 'string' ? parseInt(n) : n);
            }
          } catch (e) {
            console.error('Error al procesar números:', e);
          }
        }
        
        console.log('Números extraídos:', numbers);
        
        // Contar frecuencia de cada número
        numbers.forEach(num => {
          if (!isNaN(num)) {
            frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
          }
        });
      });

      // Convertir el mapa a un array de objetos
      const frequencyData = Array.from(frequencyMap.entries())
        .map(([number, frequency]) => ({ number, frequency }))
        .sort((a, b) => b.frequency - a.frequency);

      console.log('Números únicos encontrados:', frequencyData.length);
      console.log('Mapa de frecuencias:', Object.fromEntries(frequencyMap));

      // Obtener los 10 números más frecuentes
      const topNumbers = frequencyData.slice(0, 10);
      // Obtener los 10 números menos frecuentes
      const bottomNumbers = frequencyData.slice(-10).reverse();

      console.log('Datos procesados:', frequencyData);
      setFrequencyData(frequencyData);
      setTopNumbers(topNumbers);
      setBottomNumbers(bottomNumbers);
      console.log('Actualización de estado completada');
    } catch (error) {
      console.error('Error al obtener datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFrequencyData();
  }, [period]); // Refetch cuando cambia el período

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md text-sm">
          <p className="font-medium">{`Número: ${label}`}</p>
          <p>{`Frecuencia: ${payload[0].value} veces`}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">
          {retryCount > 0 ? 
            `Reintentando conexión (${retryCount}/${MAX_RETRIES})...` : 
            'Cargando estadísticas...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (frequencyData.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="text-muted-foreground">No hay datos disponibles</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estadísticas de números</h2>
        <div className="flex gap-2">
          <Button
            variant={period === '7days' ? 'default' : 'outline'}
            onClick={() => setPeriod('7days')}
          >
            Últimos 7 días
          </Button>
          <Button
            variant={period === '30days' ? 'default' : 'outline'}
            onClick={() => setPeriod('30days')}
          >
            Últimos 30 días
          </Button>
          <Button
            variant={period === 'all' ? 'default' : 'outline'}
            onClick={() => setPeriod('all')}
          >
            Todo el historial
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Todos los números</TabsTrigger>
          <TabsTrigger value="top10">Top 10 más frecuentes</TabsTrigger>
          <TabsTrigger value="bottom10">10 menos frecuentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={frequencyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="number" 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => value.toString().padStart(2, '0')}
                  type="category"
                  domain={['dataMin', 'dataMax']}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  type="number"
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                  label={{ 
                    value: 'Frecuencia', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'var(--foreground)' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="frequency" 
                  name="Frecuencia" 
                  fill="hsl(var(--chart-1))" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="top10" className="pt-4">
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topNumbers}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="number" 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => value.toString().padStart(2, '0')}
                  type="category"
                  domain={['dataMin', 'dataMax']}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  type="number"
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                  label={{ 
                    value: 'Frecuencia', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'var(--foreground)' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="frequency" 
                  name="Frecuencia" 
                  fill="hsl(var(--chart-2))" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        
        <TabsContent value="bottom10" className="pt-4">
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bottomNumbers}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="number" 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  tickFormatter={(value) => value.toString().padStart(2, '0')}
                  type="category"
                  domain={['dataMin', 'dataMax']}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  type="number"
                  domain={[0, 'dataMax + 1']}
                  allowDecimals={false}
                  label={{ 
                    value: 'Frecuencia', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'var(--foreground)' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="frequency" 
                  name="Frecuencia" 
                  fill="hsl(var(--chart-3))" 
                  radius={[4, 4, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Números calientes (más frecuentes)</h4>
            <div className="grid grid-cols-5 gap-2">
              {topNumbers.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-chart-2/20 text-center p-2 rounded-md flex flex-col items-center"
                >
                  <span className="text-lg font-bold">{item.number.toString().padStart(2, '0')}</span>
                  <span className="text-xs text-muted-foreground">{item.frequency}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-3">Números fríos (menos frecuentes)</h4>
            <div className="grid grid-cols-5 gap-2">
              {bottomNumbers.map((item, index) => (
                <div 
                  key={index} 
                  className="bg-chart-3/20 text-center p-2 rounded-md flex flex-col items-center"
                >
                  <span className="text-lg font-bold">{item.number.toString().padStart(2, '0')}</span>
                  <span className="text-xs text-muted-foreground">{item.frequency}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3">Resumen de estadísticas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Total de registros</p>
              <p className="text-2xl font-bold">{frequencyData.length}</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Números únicos</p>
              <p className="text-2xl font-bold">{frequencyData.length}</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Número más frecuente</p>
              <p className="text-2xl font-bold">{topNumbers[0]?.number.toString().padStart(2, '0')}</p>
            </div>
            <div className="bg-muted/20 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">Frecuencia máxima</p>
              <p className="text-2xl font-bold">{topNumbers[0]?.frequency}x</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrequencyChart;