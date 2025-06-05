"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface StatsContentProps {
  children: ReactNode;
}

const StatsContent = ({ children }: StatsContentProps) => {
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium">Loteka - Últimos 30 días</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Horario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los horarios</SelectItem>
              <SelectItem value="morning">Mediodía (12:55 PM)</SelectItem>
              <SelectItem value="evening">Tarde (7:55 PM)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="30">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Última semana</SelectItem>
              <SelectItem value="30">Último mes</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="180">Últimos 6 meses</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default StatsContent;