"use client";

import { useState } from 'react';
import { BarChart2, Calendar } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatsHeader = () => {
  const [selectedLottery, setSelectedLottery] = useState("Loteka");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Estadísticas</h1>
        <p className="text-muted-foreground mt-2">
          Análisis detallado de resultados por lotería y período
        </p>
      </div>
      
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Lotería</label>
          <Select value={selectedLottery} onValueChange={setSelectedLottery}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Seleccionar lotería" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Loteka">Loteka</SelectItem>
              <SelectItem value="Leidsa">Leidsa</SelectItem>
              <SelectItem value="Nacional">Nacional</SelectItem>
              <SelectItem value="La Primera">La Primera</SelectItem>
              <SelectItem value="Real">Real</SelectItem>
              <SelectItem value="Anguila">Anguila</SelectItem>
              <SelectItem value="New York">New York</SelectItem>
              <SelectItem value="King Lottery">King Lottery</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Período</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMM", { locale: es })} -
                      {" "}
                      {format(date.to, "d MMM, yyyy", { locale: es })}
                    </>
                  ) : (
                    format(date.from, "d MMM, yyyy", { locale: es })
                  )
                ) : (
                  <span>Seleccionar período</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90">
          <BarChart2 className="mr-2 h-4 w-4" />
          Analizar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Sorteos" 
          value="186" 
          subtitle="Período seleccionado" 
        />
        <StatCard 
          title="Número más Frecuente" 
          value="27" 
          subtitle="Apareció 18 veces" 
        />
        <StatCard 
          title="Número menos Frecuente" 
          value="93" 
          subtitle="Apareció 2 veces" 
        />
        <StatCard 
          title="Último Sorteo" 
          value={format(new Date(), "dd/MM/yyyy", { locale: es })} 
          subtitle="7:55 PM" 
        />
      </div>
    </section>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
}

const StatCard = ({ title, value, subtitle }: StatCardProps) => {
  return (
    <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
};

export default StatsHeader;