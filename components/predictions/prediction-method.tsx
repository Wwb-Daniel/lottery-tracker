"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PredictionMethod = () => {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Metodología de Predicción</h2>
        <p className="text-muted-foreground mt-1">
          Cómo generamos nuestras predicciones
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Nuestro Enfoque Analítico</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Análisis de Frecuencia</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Analizamos la frecuencia con que cada número ha aparecido en los sorteos anteriores.
                  Los números que aparecen con mayor frecuencia tienen una mayor probabilidad de ser seleccionados
                  para nuestras predicciones, mientras que también consideramos los que han sido menos frecuentes
                  para mantener un equilibrio estadístico.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>Análisis de Patrones</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Identificamos patrones recurrentes en los resultados históricos, como combinaciones
                  de números que suelen aparecer juntos, secuencias específicas, o distribuciones
                  particulares (par/impar, altos/bajos). Estos patrones influyen en nuestras predicciones.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>Algoritmos Predictivos</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Utilizamos algoritmos avanzados que combinan múltiples variables estadísticas para
                  generar predicciones. Estos algoritmos están en constante mejora, aprendiendo de 
                  los resultados pasados para refinar sus proyecciones futuras.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Nivel de Confianza</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Cada predicción incluye un nivel de confianza basado en la solidez de los patrones 
                  detectados y la consistencia de los datos históricos. Un nivel de confianza más alto
                  indica una mayor probabilidad estadística, aunque siempre dentro de los límites del azar.
                </p>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Limitaciones</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Es importante entender que todas las loterías se basan en el azar, y ningún sistema puede
                  predecir con certeza absoluta los resultados futuros. Nuestras predicciones ofrecen
                  una perspectiva estadística informada, pero los resultados reales siempre están sujetos
                  a la aleatoriedad inherente a los juegos de azar.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Importante</h3>
            <p className="text-sm text-muted-foreground">
              Nuestras predicciones son meramente informativas y no garantizan resultados en los sorteos reales.
              Le recomendamos jugar responsablemente y considerar estas predicciones solo como una referencia adicional.
              Lottery Tracker no se hace responsable de las decisiones tomadas basadas en estas predicciones.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default PredictionMethod;