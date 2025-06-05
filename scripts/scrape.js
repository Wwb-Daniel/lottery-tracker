const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { chromium } = require('playwright');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const fsPromises = require('fs').promises;

// Debug environment variables
console.log('Current directory:', __dirname);
console.log('Environment file path:', path.resolve(__dirname, '../.env'));
console.log('Environment variables:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Key exists' : 'Key missing'
});

// Initialize Supabase client with direct values and error handling
const supabaseUrl = 'https://peyokcdmiligysiqxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW9rY2RtaWxpZ3lzaXF4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjg2MzQsImV4cCI6MjA2NDY0NDYzNH0.VKK3WUSl_k0UMbO9ihEEgjf6YNs0vp5IL3Gx5GEzUCM';

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key is missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define lotteries to scrape with their specific game types
const lotteries = [
  { 
    name: 'Loteka', 
    url: 'loteka',
    games: ['Quiniela Loteka', 'Mega Chances', 'Mega Chances Repartidera', 'El Extra', 'Toca 3', 'Mega Lotto']
  },
  { 
    name: 'Leidsa', 
    url: 'leidsa',
    games: ['Quiniela Leidsa', 'Pega 3', 'Loto Pool', 'Mega Chances', 'Mega Lotto']
  },
  { 
    name: 'Nacional', 
    url: 'loteria-nacional',
    games: ['Juega+ Pega+', 'Gana Más', 'Quiniela Nacional', 'Billetes Jueves', 'Billetes Domingo']
  },
  { 
    name: 'La Primera', 
    url: 'la-primera',
    games: ['Quiniela La Primera', 'Pega 3', 'Loto Pool', 'Mega Chances']
  },
  { 
    name: 'Real', 
    url: 'loto-real',
    games: ['Quinielita Real', 'Pega 4 Real', 'Quiniela Real', 'Loto Real']
  }
];

// Mapeo de nombres de juegos a los valores aceptados por el enum
const gameTypeMapping = {
  // Loteka
  'Toca 3': 'Pega 3',
  '¿Ganaste?': 'Quiniela Loteka',
  'Mega Chances': 'Mega Chances',
  'MC Repartidera': 'Mega Chances Repartidera',
  'MegaLotto': 'Mega Lotto',
  'Quiniela Loteka': 'Quiniela Loteka',
  
  // Leidsa
  'Pega 3 Más': 'Pega 3',
  'Super Kino TV': 'Pega 3',
  'Loto - Super Loto Más': 'Loto Pool',
  'Super Palé': 'Pega 3',
  'Quiniela Leidsa': 'Quiniela Leidsa',
  
  // Nacional
  'Juega+ Pega+': 'Pega 3',
  'Gana Más': 'Pega 3',
  'Billetes Jueves': 'Billetes Jueves',
  'Billetes Domingo': 'Billetes Domingo',
  'Quiniela Nacional': 'Quiniela Nacional',
  
  // La Primera
  'El Quinielón Día': 'Quiniela La Primera',
  'El Quinielón Noche': 'Quiniela La Primera',
  'Quiniela La Primera': 'Quiniela La Primera',
  'Primera Noche': 'Quiniela La Primera',
  'Loto 5': 'Loto Pool',
  
  // Real
  'Tu Fecha Real': 'Quiniela Real',
  'Pega 4 Real': 'Pega 4 Real',
  'Nueva Yol Real': 'Quiniela Real',
  'Loto Real': 'Loto Real',
  'Quiniela Real': 'Quiniela Real',
  'Quinielita Real': 'Quiniela Real',
  'Super Pale': 'Pega 3'
};

// Función para obtener el ID de la lotería
async function getLotteryId(lotteryName) {
  const { data, error } = await supabase
    .from('lotteries')
    .select('id')
    .eq('name', lotteryName)
    .single();

  if (error) {
    console.error(`Error obteniendo ID de lotería ${lotteryName}:`, error.message);
    throw error;
  }

  return data.id;
}

// Función para guardar log de scraping
async function saveScrapingLog(lotteryId, status, message, details = {}) {
  try {
    const { data, error } = await supabase
      .from('scraping_logs')
      .insert([{
        lottery_id: lotteryId,
        status,
        message,
        details
      }])
      .select();

    if (error) {
      console.error('Error guardando log de scraping:', error.message);
      // Intentar guardar en la tabla results como fallback
      await supabase
        .from('results')
        .insert([{
          lottery_id: lotteryId,
          draw_date: new Date().toISOString().split('T')[0],
          draw_time: new Date().toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' }),
          numbers: [],
          error_log: JSON.stringify({ status, message, details })
        }]);
    } else {
      console.log('Log guardado exitosamente:', data);
    }
  } catch (error) {
    console.error('Error inesperado guardando log:', error.message);
  }
}

// Función para extraer números según el tipo de juego
function extractNumbersByGameType(gameType, numbers) {
  switch(gameType) {
    case 'Juega+ Pega+':
      return {
        special1: numbers.filter(n => n.className.includes('special1')).map(n => n.textContent.trim()),
        special2: numbers.filter(n => n.className.includes('special2')).map(n => n.textContent.trim()),
        regular: numbers.filter(n => !n.className.includes('special')).map(n => n.textContent.trim())
      };
    case 'Quiniela Loteka':
    case 'Quiniela Leidsa':
    case 'Quiniela Nacional':
    case 'Quiniela La Primera':
    case 'Quiniela Real':
    case 'Quinielita Real':
      return numbers.slice(0, 3); // Primeros 3 números
    case 'Pega 3':
    case 'Toca 3':
      return numbers.slice(0, 3); // Primeros 3 números
    case 'Pega 4 Real':
      return numbers.slice(0, 4); // Primeros 4 números
    case 'Loto Pool':
    case 'Loto 5':
      return numbers.slice(0, 5); // Primeros 5 números
    case 'Mega Lotto':
    case 'Mega Millions':
    case 'PowerBall':
    case 'Cash 4 Life':
      return numbers.slice(0, 6); // Primeros 6 números
    case 'Mega Chances':
    case 'Mega Chances Repartidera':
      return numbers.slice(0, 5); // Primeros 5 números
    default:
      return numbers.slice(0, 3); // Por defecto, primeros 3 números
  }
}

// Función para borrar resultados anteriores
async function deletePreviousResults(lotteryId) {
  const { error: deleteError } = await supabase
    .from('lottery_results')
    .delete()
    .eq('lottery_id', lotteryId);

  if (deleteError) {
    console.error(`Error borrando resultados anteriores para lotería ${lotteryId}:`, deleteError.message);
  } else {
    console.log(`Resultados anteriores borrados para lotería ${lotteryId}`);
  }
}

// Función para formatear los resultados
function formatLotteryResult(lotteryId, result, lotteryName) {
  // Asegurarnos de que los números sean un array de números
  const numbers = Array.isArray(result.numbers) ? result.numbers : [result.numbers];
  
  // Usar la fecha del sorteo si está disponible, de lo contrario usar la fecha actual
  const today = new Date();
  const drawDate = result.drawDate || today.toISOString().split('T')[0];
  
  return {
    lottery_id: lotteryId,
    lottery_name: lotteryName,
    draw_date: drawDate,
    draw_time: '00:00', // Valor por defecto para evitar not-null constraint
    numbers: numbers, // Guardar los números filtrados
    subtitle: result.subtitle, // Agregar el subtítulo
    game_type: result.gameType, // Agregar el tipo de juego
    result_order: result.resultOrder // Agregar el orden del resultado
  };
}

async function scrapeLotteryResults() {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('Starting scraping process...');
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Set default timeout
    page.setDefaultTimeout(30000);
    
    for (const lottery of lotteries) {
      try {
        console.log(`\nScraping results for ${lottery.name}...`);
        
        // Navigate to the lottery website
        const url = `https://loteriasdominicanas.com/${lottery.url}`;
        console.log(`Navigating to ${url}...`);
        
        // Navigate with retry
        let retries = 3;
        while (retries > 0) {
          try {
            await page.goto(url, { 
              waitUntil: 'networkidle',
              timeout: 30000
            });
            break;
          } catch (error) {
            console.log(`Navigation attempt failed, retries left: ${retries - 1}`);
            retries--;
            if (retries === 0) throw error;
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        
        // Wait for the page to load
        console.log('Waiting for page to load...');
        await page.waitForSelector('.game-block, .game-scores', { 
          timeout: 30000,
          state: 'attached'
        });
        
        // Wait for dynamic content
        await page.waitForTimeout(5000);
        
        // Get the page content
        console.log('Getting page content...');
        const content = await page.content();
        console.log('Page content length:', content.length);
        
        // Save HTML content for debugging
        fs.writeFileSync(`${lottery.name.toLowerCase()}_page.html`, content);
        console.log(`Saved HTML content to: ${process.cwd()}/${lottery.name.toLowerCase()}_page.html`);
        
        // Extract results
        console.log('Extracting results...');
        const results = await page.evaluate(({ lotteryName, lotteryGames }) => {
          const lotteryResults = [];
          
          // Buscar todos los bloques de resultados
          const resultBlocks = document.querySelectorAll('.game-block');
          
          resultBlocks.forEach((block, index) => {
            try {
              // Obtener la fecha del sorteo
              const dateElement = block.querySelector('.session-date');
              let drawDate = '';
              if (dateElement) {
                const dateText = dateElement.textContent.trim();
                // Extraer la fecha del texto (formato: "DD-MM")
                const dateMatch = dateText.match(/(\d{2})-(\d{2})/);
                if (dateMatch) {
                  const [_, day, month] = dateMatch;
                  const year = new Date().getFullYear();
                  drawDate = `${year}-${month}-${day}`;
                }
              }

              // Obtener el tipo de juego - Mejorado para obtener el nombre correcto
              const gameTypeElement = block.querySelector('.game-title, .game-name, h3, h4');
              let gameType = '';
              if (gameTypeElement) {
                gameType = gameTypeElement.textContent.trim();
                console.log(`Juego encontrado: ${gameType}`); // Debug log
              }

              // Obtener los números
              const numberElements = block.querySelectorAll('.score');
              const numbers = Array.from(numberElements);

              // Separar números especiales y regulares
              const special1Numbers = numbers
                .filter(n => n.className.includes('special1'))
                .map(n => n.textContent.trim());
              
              const special2Numbers = numbers
                .filter(n => n.className.includes('special2'))
                .map(n => n.textContent.trim());
              
              const regularNumbers = numbers
                .filter(n => !n.className.includes('special'))
                .map(n => n.textContent.trim());

              // Crear el resultado
              const result = {
                drawDate,
                gameType,
                numbers: {
                  special1: special1Numbers,
                  special2: special2Numbers,
                  regular: regularNumbers
                },
                subtitle: gameType,
                resultOrder: index + 1
              };

              lotteryResults.push(result);
            } catch (error) {
              console.error('Error processing result block:', error);
            }
          });

          return lotteryResults;
        }, { lotteryName: lottery.name, lotteryGames: lottery.games });

        console.log(`Found ${results.length} results for ${lottery.name}:`, JSON.stringify(results, null, 2));
        
        if (results.length > 0) {
          try {
            // Obtener el ID de la lotería
            const lotteryId = await getLotteryId(lottery.name);
            
            // Borrar resultados anteriores
            await deletePreviousResults(lotteryId);
            
            // Formatear los resultados
            const formattedResults = results.map(result => {
              // Convertir los números a un formato plano para la base de datos
              const allNumbers = [
                ...result.numbers.special1,
                ...result.numbers.special2,
                ...result.numbers.regular
              ];
              
              // Normalizar el tipo de juego usando el mapeo
              let normalizedGameType = gameTypeMapping[result.gameType];
              
              // Si no hay mapeo, usar un valor por defecto basado en el tipo de números
              if (!normalizedGameType) {
                if (allNumbers.length === 3) {
                  normalizedGameType = 'Pega 3';
                } else if (allNumbers.length === 4) {
                  normalizedGameType = 'Pega 4 Real';
                } else if (allNumbers.length === 5) {
                  normalizedGameType = 'Loto Pool';
                } else {
                  normalizedGameType = 'Quiniela Real';
                }
                console.log(`No se encontró mapeo para el juego: ${result.gameType}, usando valor por defecto: ${normalizedGameType}`);
              }
              
              return {
                lottery_id: lotteryId,
                draw_date: result.drawDate,
                draw_time: '00:00',
                numbers: allNumbers,
                subtitle: result.subtitle,
                game_type: normalizedGameType,
                result_order: result.resultOrder
              };
            });
            
            console.log(`Preparando para guardar ${formattedResults.length} resultados para ${lottery.name}`);
            
            // Guardar cada resultado individualmente
            for (const result of formattedResults) {
              const { data, error } = await supabase
                .from('lottery_results')
                .insert([result])
                .select();
                
              if (error) {
                console.error(`Error guardando resultado para ${lottery.name}:`, error.message);
                console.error('Datos que causaron el error:', result);
              } else {
                console.log(`Resultado guardado exitosamente para ${lottery.name}:`, data);
              }
            }
          } catch (error) {
            console.error(`Error inesperado guardando resultados para ${lottery.name}:`, error.message);
            console.error('Stack trace:', error.stack);
          }
        } else {
          console.log(`No se encontraron resultados para ${lottery.name}`);
        }
      } catch (error) {
        console.error(`Error scraping ${lottery.name}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error in scraping process:', error);
  } finally {
    await browser.close();
  }
}

// Run scraper every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled scraping...');
  try {
    await scrapeLotteryResults();
  } catch (error) {
    console.error('Scheduled scraping failed:', error);
  }
});

// Run scraper immediately on start
scrapeLotteryResults();

// URLs de las loterías
const LOTERIES = {
  loteka: 'https://www.loteka.com.do/',
  real: 'https://www.real.com.do/',
  primera: 'https://www.laprimera.com.do/',
  nacional: 'https://www.loterianacional.com.do/',
  leidsa: 'https://www.leidsa.com/'
};

async function scrapeLottery(url, name) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    
    // Guardar el HTML para debugging
    await fsPromises.writeFile(`${name}_page.html`, html);
    
    const $ = cheerio.load(html);
    let results = [];
    
    // Lógica específica para cada lotería
    switch(name) {
      case 'loteka':
        // Implementar scraping específico para Loteka
        break;
      case 'real':
        // Implementar scraping específico para Real
        break;
      case 'primera':
        // Implementar scraping específico para Primera
        break;
      case 'nacional':
        // Implementar scraping específico para Nacional
        break;
      case 'leidsa':
        // Implementar scraping específico para Leidsa
        break;
    }
    
    return results;
  } catch (error) {
    console.error(`Error scraping ${name}:`, error.message);
    return [];
  }
}

async function main() {
  const allResults = {};
  
  for (const [name, url] of Object.entries(LOTERIES)) {
    console.log(`Scraping ${name}...`);
    const results = await scrapeLottery(url, name);
    allResults[name] = results;
  }
  
  // Guardar resultados en JSON
  await fsPromises.writeFile(
    'lottery_results.json',
    JSON.stringify(allResults, null, 2)
  );
  
  console.log('Scraping completado!');
}

main().catch(console.error);