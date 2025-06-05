"use client";

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, CheckCircle, Clock, CloudOff, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';

// Sample data for the chart
const generateChartData = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourString = hour.getHours().toString().padStart(2, '0');
    
    data.push({
      hour: `${hourString}:00`,
      successRate: Math.min(100, Math.max(70, 100 - Math.random() * 30)),
      errorRate: Math.min(30, Math.max(0, Math.random() * 30)),
    });
  }
  
  return data;
};

const chartData = generateChartData();

const SystemStatus = () => {
  // Sample status data
  const statuses = [
    { name: 'API Server', status: 'operational', icon: Server },
    { name: 'Base de Datos', status: 'operational', icon: Server },
    { name: 'Scraping Worker', status: 'operational', icon: ArrowUpRight },
    { name: 'Scheduler', status: 'operational', icon: Clock },
    { name: 'Conexión Externa', status: 'operational', icon: CloudOff },
  ];
  
  const getStatusIcon = (status: string) => {
    if (status === 'operational') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    if (status === 'warning') return <ArrowUpRight className="h-4 w-4 text-amber-500" />;
    return <CloudOff className="h-4 w-4 text-rose-500" />;
  };
  
  const getStatusText = (status: string) => {
    if (status === 'operational') return 'Operativo';
    if (status === 'warning') return 'Advertencia';
    return 'Error';
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md text-sm">
          <p className="font-medium">{`Hora: ${label}`}</p>
          <p className="text-emerald-500">{`Éxito: ${payload[0].value.toFixed(1)}%`}</p>
          <p className="text-rose-500">{`Error: ${payload[1].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Estado de Componentes</h3>
            <div className="space-y-4">
              {statuses.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                  <Badge 
                    variant={item.status === 'operational' ? 'outline' : 'destructive'}
                    className="flex items-center gap-1"
                  >
                    {getStatusIcon(item.status)}
                    {getStatusText(item.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Rendimiento del Sistema</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CPU</span>
                  <span className="text-sm text-muted-foreground">28%</span>
                </div>
                <Progress value={28} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Memoria</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Almacenamiento</span>
                  <span className="text-sm text-muted-foreground">62%</span>
                </div>
                <Progress value={62} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Red</span>
                  <span className="text-sm text-muted-foreground">17%</span>
                </div>
                <Progress value={17} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Tasa de Éxito de Scraping (Últimas 12 horas)</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="hour" 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                />
                <YAxis 
                  className="text-xs" 
                  tick={{ fill: 'var(--foreground)' }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  name="Tasa de Éxito" 
                  stroke="hsl(var(--chart-2))" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="errorRate" 
                  name="Tasa de Error" 
                  stroke="hsl(var(--destructive))" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemStatus;