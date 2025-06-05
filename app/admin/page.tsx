"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUpRight, CheckCircle, Play, XCircle } from "lucide-react";
import ScrapingLogs from '@/components/admin/scraping-logs';
import SystemStatus from '@/components/admin/system-status';
import ManualScraping from '@/components/admin/manual-scraping';

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(true); // In a real app, this would be based on authentication
  
  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-xl font-bold">Acceso Restringido</h1>
        <p className="mt-2 text-muted-foreground">
          No tiene permisos para acceder al panel de administración.
        </p>
        <Button className="mt-4" variant="outline" asChild>
          <a href="/">Volver al inicio</a>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground mt-2">
            Gestión del sistema de scraping y monitoreo
          </p>
        </div>
        
        <Button className="bg-primary hover:bg-primary/90">
          <Play className="mr-2 h-4 w-4" />
          Ejecutar Scraping Manual
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SystemStatusCard 
          title="Estado del Sistema" 
          status="Activo" 
          description="El sistema está funcionando correctamente" 
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        />
        <SystemStatusCard 
          title="Último Scraping" 
          status="Hace 35 minutos" 
          description="El último scraping se completó con éxito" 
          icon={<CheckCircle className="h-5 w-5 text-emerald-500" />}
        />
        <SystemStatusCard 
          title="Próximo Scraping" 
          status="En 25 minutos" 
          description="Programado para las 12:00 PM" 
          icon={<ArrowUpRight className="h-5 w-5 text-amber-500" />}
        />
      </div>
      
      <Tabs defaultValue="logs">
        <TabsList className="grid w-full grid-cols-3 max-w-md mb-8">
          <TabsTrigger value="logs">Logs de Scraping</TabsTrigger>
          <TabsTrigger value="status">Estado del Sistema</TabsTrigger>
          <TabsTrigger value="manual">Scraping Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Scraping</CardTitle>
              <CardDescription>
                Registros de las operaciones de scraping realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrapingLogs />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Estado del Sistema</CardTitle>
              <CardDescription>
                Monitoreo del estado general del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemStatus />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Scraping Manual</CardTitle>
              <CardDescription>
                Ejecutar manualmente el proceso de scraping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ManualScraping />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SystemStatusCardProps {
  title: string;
  status: string;
  description: string;
  icon: React.ReactNode;
}

const SystemStatusCard = ({ title, status, description, icon }: SystemStatusCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon}
        </div>
        <div className="mt-1">
          <p className="text-2xl font-bold">{status}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};