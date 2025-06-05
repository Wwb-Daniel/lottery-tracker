import cron from 'node-cron';
import { scrapeLotteryResults } from './scraper';

// Function to initialize the cron job
export function initScrapingScheduler() {
  // Schedule scraping every hour at the top of the hour
  cron.schedule('0 * * * *', async () => {
    console.log(`Running scheduled scraping at ${new Date().toISOString()}`);
    try {
      await scrapeLotteryResults();
      console.log('Scheduled scraping completed successfully');
    } catch (error) {
      console.error('Error in scheduled scraping:', error);
    }
  });
  
  console.log('Scraping scheduler initialized');
}

// Function to run the scheduler when the app starts
export function startScheduler() {
  try {
    initScrapingScheduler();
    return { success: true, message: 'Scheduler started successfully' };
  } catch (error: any) {
    console.error('Failed to start scheduler:', error);
    return { success: false, message: `Failed to start scheduler: ${error.message}` };
  }
}