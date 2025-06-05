import { NextResponse } from 'next/server';
import { scrapeLotteryResults } from '@/services/scraper';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotteryId = searchParams.get('lotteryId') || undefined;
    
    const result = await scrapeLotteryResults(lotteryId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}