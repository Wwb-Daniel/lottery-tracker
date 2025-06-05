require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;

// Configurar Supabase con credenciales directas
const supabaseUrl = 'https://peyokcdmiligysiqxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW9rY2RtaWxpZ3lzaXF4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjg2MzQsImV4cCI6MjA2NDY0NDYzNH0.VKK3WUSl_k0UMbO9ihEEgjf6YNs0vp5IL3Gx5GEzUCM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de tipos de juego
const gameTypeMapping = {
  'Toca 3': 'Toca 3',
  'Quiniela Loteka': 'Quiniela Loteka',
  'Mega Chances': 'Mega Chances',
  'MC Repartidera': 'Mega Chances Repartidera',
  'MegaLotto': 'Mega Lotto',
  'Juega + Pega +': 'Juega+ Pega+',
  'Gana Más': 'Gana Más',
  'Lotería Nacional': 'Quiniela Nacional',
  'Billetes Domingo': 'Billetes Domingo',
  'Pega 3 Más': 'Pega 3',
  'Quiniela Leidsa': 'Quiniela Leidsa',
  'Loto Pool': 'Loto Pool',
  'Super Kino TV': 'Super Kino TV',
  'Loto - Super Loto Más': 'Mega Lotto',
  'Super Palé': 'Super Palé',
  'Tu Fecha Real': 'Tu Fecha Real',
  'Pega 4 Real': 'Pega 4 Real',
  'Quiniela Real': 'Quiniela Real',
  'Nueva Yol Real': 'Nueva Yol Real',
  'Loto Real': 'Loto Real',
  'El Quinielón Día': 'Quiniela Nacional',
  'La Primera Día': 'Quiniela La Primera',
  'El Quinielón Noche': 'Quiniela Nacional',
  'Primera Noche': 'Quiniela La Primera',
  'Loto 5': 'Loto Pool'
};

async function importResults() {
  try {
    // Leer el archivo JSON
    const data = await fs.readFile('lottery_results.json', 'utf8');
    const results = JSON.parse(data);

    console.log(`Importando ${results.length} resultados...`);

    for (const result of results) {
      try {
        // Obtener el ID de la lotería
        const { data: lotteryData, error: lotteryError } = await supabase
          .from('lotteries')
          .select('id')
          .eq('url_slug', result.source)
          .single();

        if (lotteryError) {
          console.error(`Error al obtener ID de lotería para ${result.source}:`, lotteryError);
          continue;
        }

        // Convertir fecha al formato correcto
        const [day, month] = result.date.split('-');
        const currentYear = new Date().getFullYear();
        const drawDate = new Date(currentYear, month - 1, day);

        // Convertir números a enteros
        const numbers = result.numbers.map(num => parseInt(num, 10));

        // Verificar si el tipo de juego está en el mapeo
        const gameType = gameTypeMapping[result.game_type];
        if (!gameType) {
          console.log(`Tipo de juego no mapeado: ${result.game_type}`);
          continue;
        }

        // Insertar resultado en la base de datos
        const { data, error } = await supabase
          .from('lottery_results')
          .insert({
            lottery_id: lotteryData.id,
            draw_date: drawDate.toISOString().split('T')[0],
            draw_time: '00:00:00',
            game_type: gameType,
            numbers: numbers,
            result_order: 1
          })
          .select();

        if (error) {
          if (error.code === '23505') {
            console.warn(`AVISO: Resultado duplicado para ${result.company} - ${result.game_type}`);
          } else {
            console.error(`Error al insertar resultado para ${result.company} - ${result.game_type}:`, error);
          }
        } else {
          console.log(`Resultado importado: ${result.company} - ${result.game_type}`);
        }
      } catch (error) {
        console.error(`Error procesando resultado:`, error);
      }
    }

    console.log('Importación completada');
  } catch (error) {
    console.error('Error en la importación:', error);
  }
}

// Ejecutar la importación
importResults(); 