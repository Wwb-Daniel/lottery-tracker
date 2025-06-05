import { chromium } from 'playwright';
import { supabase } from '@/lib/supabase';
import { ScrapingLog } from '@/types';

export async function scrapeLotteryResults(lotteryId?: string) {
  const browser = await chromium.launch({
    headless: true,
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the lottery website
    await page.goto('https://www.loteriasdominicanas.com/', { waitUntil: 'networkidle' });
    
    console.log(`Scraping started for ${lotteryId || 'all lotteries'}`);
    
    // Get the lottery data
    let lotteries = [];
    
    if (lotteryId) {
      // If a specific lottery is requested, query just that one
      const { data, error } = await supabase
        .from('lotteries')
        .select('*')
        .eq('id', lotteryId);
      
      if (error) throw new Error(`Error fetching lottery: ${error.message}`);
      lotteries = data || [];
    } else {
      // Otherwise, get all lotteries
      const { data, error } = await supabase
        .from('lotteries')
        .select('*');
      
      if (error) throw new Error(`Error fetching lotteries: ${error.message}`);
      lotteries = data || [];
    }
    
    // For each lottery, scrape the results
    for (const lottery of lotteries) {
      try {
        // Log start of scraping for this lottery
        await logScrapingOperation(lottery.id, 'success', `Starting scraping for ${lottery.name}`);
        
        // Select the lottery tab/section on the website
        // This would need to be adjusted based on the actual website structure
        // For example, if there are tabs for each lottery:
        const lotterySelector = getLotterySelector(lottery.name);
        await page.click(lotterySelector);
        
        // Wait for the results to load
        await page.waitForSelector('.lottery-results', { timeout: 5000 });
        
        // Extract the results
        const results = await extractLotteryResults(page, lottery);
        
        // Store results in the database
        if (results.length > 0) {
          for (const result of results) {
            const { error } = await supabase
              .from('results')
              .upsert({
                lottery_id: lottery.id,
                draw_date: result.date,
                draw_time: result.time,
                numbers: result.numbers,
              }, {
                onConflict: 'lottery_id, draw_date, draw_time'
              });
            
            if (error) {
              throw new Error(`Error storing results: ${error.message}`);
            }
          }
          
          await logScrapingOperation(
            lottery.id, 
            'success', 
            `Successfully scraped ${results.length} results for ${lottery.name}`
          );
        } else {
          await logScrapingOperation(
            lottery.id, 
            'warning', 
            `No results found for ${lottery.name}`
          );
        }
      } catch (error: any) {
        console.error(`Error scraping ${lottery.name}:`, error);
        await logScrapingOperation(
          lottery.id, 
          'error', 
          `Error scraping ${lottery.name}: ${error.message}`,
          { error: error.toString(), stack: error.stack }
        );
      }
    }
    
    console.log('Scraping completed successfully');
    return { success: true, message: 'Scraping completed successfully' };
  } catch (error: any) {
    console.error('Scraping failed:', error);
    return { 
      success: false, 
      message: `Scraping failed: ${error.message}`, 
      error 
    };
  } finally {
    await browser.close();
  }
}

// Helper function to determine the selector for a lottery
function getLotterySelector(lotteryName: string): string {
  // This would need to be updated based on the actual website structure
  const selectors: Record<string, string> = {
    'Loteka': '#loteka-tab',
    'Leidsa': '#leidsa-tab',
    'Nacional': '#nacional-tab',
    'La Primera': '#primera-tab',
    'Real': '#real-tab',
    'Anguila': '#anguila-tab',
    'New York': '#newyork-tab',
    'King Lottery': '#king-tab',
  };
  
  return selectors[lotteryName] || '#loteka-tab'; // Default to Loteka if not found
}

// Extract lottery results from the page
async function extractLotteryResults(page: any, lottery: any) {
  // This would need to be updated based on the actual website structure
  // This is a simplified example
  
  const results = [];
  
  // Get today's date
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // For each draw time of this lottery
  for (const drawTime of lottery.draw_times) {
    try {
      // Find the section for this draw time
      // This selector would need to be adjusted based on the actual website
      const drawTimeSelector = `.draw-time[data-time="${drawTime}"]`;
      const drawSection = await page.$(drawTimeSelector);
      
      if (drawSection) {
        // Extract the numbers
        // Again, selectors would need to be adjusted
        const numberElements = await drawSection.$$('.number');
        const numbers = [];
        
        for (const el of numberElements) {
          const number = await el.textContent();
          numbers.push(parseInt(number.trim(), 10));
        }
        
        if (numbers.length > 0) {
          results.push({
            date: formattedDate,
            time: drawTime,
            numbers
          });
        }
      }
    } catch (error) {
      console.error(`Error extracting results for ${lottery.name} at ${drawTime}:`, error);
    }
  }
  
  return results;
}

// Log the scraping operation
async function logScrapingOperation(
  lotteryId: string, 
  status: 'success' | 'error' | 'warning', 
  message: string,
  details?: any
) {
  try {
    const { error } = await supabase
      .from('scraping_logs')
      .insert({
        lottery_id: lotteryId,
        status,
        message,
        details
      });
    
    if (error) {
      console.error('Error logging scraping operation:', error);
    }
  } catch (error) {
    console.error('Error logging scraping operation:', error);
  }
}

export async function getLatestScrapingLogs(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('scraping_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching scraping logs:', error);
    return [];
  }
}