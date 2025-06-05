import { NextResponse } from 'next/server';
import { generatePredictions, getLotteryPredictions } from '@/services/predictions';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotteryId = searchParams.get('lotteryId');
    
    if (!lotteryId) {
      return NextResponse.json(
        { error: 'Lottery ID is required' },
        { status: 400 }
      );
    }
    
    const predictions = await getLotteryPredictions(lotteryId);
    
    return NextResponse.json({ predictions });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lotteryId } = body;
    
    if (!lotteryId) {
      return NextResponse.json(
        { error: 'Lottery ID is required' },
        { status: 400 }
      );
    }
    
    const predictions = await generatePredictions(lotteryId);
    
    return NextResponse.json({ predictions });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}