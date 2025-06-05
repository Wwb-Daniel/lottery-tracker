"use client";

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PatternAnalysis = () => {
  // Sample data for demonstrative purposes
  const trendData = Array(30).fill(0).map((_, i) => ({
    day: i + 1,
    primero: Math.floor(Math.random() * 100),
    segundo: Math.floor(Math.random() * 100),
    tercero: Math.floor(Math.random() * 100),
  }));
  
  const parImparData = [
    { name: 'Pares', value: 62 },
    { name: 'Impares', value: 38 },
  ];
  
  const rangoData = [
    { name: '0-24', value: 25 },
    { name: '25-49', value: 32 },
    { name: '50-74', value: 28 },
    { name: '75-99', value: 15 },
  ];
  
  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md text-sm">
          <p className="font-medium">{`Día: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md text-sm">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Generate sample pairs that have appeared
  const generatePairs = () => {
    const pairs = [];
    for (let i = 0; i < 12; i++) {
      const num1 = Math.floor(Math.random() * 100);
      const num2 = Math.floor(Math.random() * 100);
      const frequency = Math.floor(Math.random() * 10) + 1;
      pairs.push({ pair: `${num1.toString().padStart(2, '0')}-${num2.toString().padStart(2, '0')}`, frequency });
    }
    return pairs.sort((a, b) => b.frequency - a.frequency);
  };
  
  const frequentPairs = generatePairs();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="trends">
        <TabsList>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="pairs">Pares Frecuentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tendencia de Números por Posición</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="day" 
                      className="text-xs" 
                      tick={{ fill: 'var(--foreground)' }}
                      label={{ value: 'Día', position: 'insideBottomRight', offset: 0 }}
                    />
                    <YAxis 
                      className="text-xs" 
                      tick={{ fill: 'var(--foreground)' }}
                      domain={[0, 99]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="primero" 
                      name="1er Número" 
                      stroke="hsl(var(--chart-1))" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="segundo" 
                      name="2do Número" 
                      stroke="hsl(var(--chart-2))" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tercero" 
                      name="3er Número" 
                      stroke="hsl(var(--chart-3))" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución Par/Impar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={parImparData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {parImparData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Rango</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={rangoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {rangoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieCustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pairs" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pares de Números más Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {frequentPairs.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-muted p-3 rounded-lg text-center"
                  >
                    <div className="font-bold text-lg">{item.pair}</div>
                    <div className="text-sm text-muted-foreground">{item.frequency} veces</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatternAnalysis;