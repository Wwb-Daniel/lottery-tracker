"use client";

import { motion } from 'framer-motion';
import { Ticket, TrendingUp, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const features = [
    { 
      icon: Ticket, 
      title: 'Resultados en Tiempo Real', 
      description: 'Accede a los resultados de todas las loterías dominicanas al instante.',
    },
    { 
      icon: TrendingUp, 
      title: 'Estadísticas Detalladas', 
      description: 'Analiza frecuencias y patrones para tomar decisiones informadas.',
    },
    { 
      icon: Clock, 
      title: 'Historial Completo', 
      description: 'Consulta todos los resultados anteriores organizados por fecha.',
    },
    { 
      icon: Award, 
      title: 'Predicciones Inteligentes', 
      description: 'Obtén predicciones basadas en análisis estadístico de resultados anteriores.',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <section className="py-12 md:py-16 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-primary">Seguimiento</span> inteligente de loterías dominicanas
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg">
            La herramienta más completa para consultar resultados, analizar estadísticas y 
            obtener predicciones para todas las loterías de República Dominicana.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Ver resultados
            </Button>
            <Button size="lg" variant="outline">
              Estadísticas
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-lg blur-xl opacity-50"></div>
          <div className="relative bg-card p-6 rounded-lg shadow-lg border border-border">
            <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
              Actualizado
            </div>
            <h3 className="font-bold text-lg mb-4">Resultados de Loteka (Hoy)</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-2">Quiniela (12:55 PM)</div>
                <div className="flex justify-center gap-3">
                  {[14, 82, 37].map((num, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md"
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Quiniela (7:55 PM)</div>
                <div className="flex justify-center gap-3">
                  {[95, 61, 24].map((num, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-md"
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Features section */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            variants={itemVariants}
            className="bg-card rounded-lg p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default HeroSection;