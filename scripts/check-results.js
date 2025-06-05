const { createClient } = require('@supabase/supabase-js');

// Configurar Supabase con credenciales directas
const supabaseUrl = 'https://peyokcdmiligysiqxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW9rY2RtaWxpZ3lzaXF4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjg2MzQsImV4cCI6MjA2NDY0NDYzNH0.VKK3WUSl_k0UMbO9ihEEgjf6YNs0vp5IL3Gx5GEzUCM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkResults() {
  try {
    // Obtener todos los resultados
    const { data: results, error } = await supabase
      .from('lottery_results')
      .select(`
        *,
        lotteries!fk_lottery_result (
          name
        )
      `)
      .order('draw_date', { ascending: false });

    if (error) {
      console.error('Error al obtener resultados:', error);
      return;
    }

    console.log(`\nTotal de resultados en la base de datos: ${results.length}\n`);

    // Agrupar resultados por lotería y tipo de juego
    const groupedResults = results.reduce((acc, result) => {
      const lotteryName = result.lotteries?.name || 'Desconocida';
      if (!acc[lotteryName]) {
        acc[lotteryName] = {};
      }
      if (!acc[lotteryName][result.game_type]) {
        acc[lotteryName][result.game_type] = [];
      }
      acc[lotteryName][result.game_type].push(result);
      return acc;
    }, {});

    // Mostrar resumen por lotería y tipo de juego
    Object.entries(groupedResults).forEach(([lotteryName, gameTypes]) => {
      console.log(`\n${lotteryName}:`);
      console.log('-'.repeat(50));
      Object.entries(gameTypes).forEach(([gameType, results]) => {
        console.log(`${gameType}: ${results.length} resultados`);
        if (results.length > 0) {
          console.log(`Último resultado: ${results[0].draw_date}`);
          console.log(`Números: ${results[0].numbers.join(', ')}`);
        }
        console.log('-'.repeat(30));
      });
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkResults(); 