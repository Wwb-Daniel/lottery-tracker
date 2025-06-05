"use client";

import RecentDraws from '@/components/recent-draws';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <main className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Sorteos Recientes</h2>
        <Link href="/stats">
          <Button variant="outline" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Ver Estadísticas Detalladas
          </Button>
        </Link>
      </div>
      <RecentDraws />
    </main>
  );
}