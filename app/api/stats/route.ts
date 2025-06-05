import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { NumberFrequency } from '@/types';

interface LotteryResult {
  numbers: number[];
  draw_date: string;
  draw_time: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotteryId = searchParams.get('lotteryId');
    const period = parseInt(searchParams.get('period') || '30', 10); // Days
    
    if (!lotteryId) {
      return NextResponse.json(
        { error: 'Lottery ID is required' },
        { status: 400 }
      );
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - period);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Get results for this lottery in the date range
    const { data: results, error } = await supabase
      .from('results')
      .select('*')
      .eq('lottery_id', lotteryId)
      .gte('draw_date', startDateStr)
      .lte('draw_date', endDateStr);
    
    if (error) throw error;
    
    if (!results || results.length === 0) {
      return NextResponse.json({ 
        frequency: [],
        lastDrawDate: null,
        totalDraws: 0
      });
    }
    
    // Calculate number frequency
    const frequencyMap: Record<number, number> = {};
    
    results.forEach((result: LotteryResult) => {
      result.numbers.forEach((num: number) => {
        frequencyMap[num] = (frequencyMap[num] || 0) + 1;
      });
    });
    
    // Create array of number frequencies
    const frequency: NumberFrequency[] = [];
    
    // Ensure all numbers from 0-99 are represented
    for (let i = 0; i < 100; i++) {
      frequency.push({
        number: i,
        frequency: frequencyMap[i] || 0
      });
    }
    
    // Sort results by date to find last draw
    const sortedResults = [...results].sort((a, b) => {
      // Compare dates first
      const dateA = new Date(a.draw_date).getTime();
      const dateB = new Date(b.draw_date).getTime();
      
      if (dateA !== dateB) return dateB - dateA;
      
      // If same date, compare times
      return a.draw_time.localeCompare(b.draw_time);
    });
    
    const lastDrawDate = sortedResults[0]?.draw_date || null;
    
    return NextResponse.json({
      frequency,
      lastDrawDate,
      totalDraws: results.length
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}