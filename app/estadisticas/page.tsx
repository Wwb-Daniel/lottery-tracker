import StatsHeader from '@/components/stats/stats-header';
import StatsContent from '@/components/stats/stats-content';
import FrequencyChart from '@/components/stats/frequency-chart';
import PatternAnalysis from '@/components/stats/pattern-analysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <StatsHeader />
      
      <Tabs defaultValue="frequency" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="frequency">Frecuencia</TabsTrigger>
          <TabsTrigger value="patterns">Patrones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frequency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Frecuencia</CardTitle>
              <CardDescription>
                Visualización de los números más y menos frecuentes por lotería
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <StatsContent>
                <FrequencyChart />
              </StatsContent>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Patrones</CardTitle>
              <CardDescription>
                Identificación de patrones y secuencias en los resultados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <StatsContent>
                <PatternAnalysis />
              </StatsContent>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Resultados</CardTitle>
              <CardDescription>
                Consulta de resultados históricos por lotería y fecha
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <StatsContent>
                <div className="p-6">
                  <p className="text-muted-foreground">
                    Seleccione una lotería y fecha para ver los resultados históricos.
                  </p>
                </div>
              </StatsContent>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}