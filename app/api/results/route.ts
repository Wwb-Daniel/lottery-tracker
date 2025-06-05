import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lotteryId = searchParams.get('lotteryId');
    const date = searchParams.get('date'); // Format: YYYY-MM-DD
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    let query = supabase
      .from('results')
      .select(`
        id,
        lottery_id,
        draw_date,
        draw_time,
        numbers,
        created_at,
        lotteries (
          id,
          name,
          country
        )
      `)
      .order('draw_date', { ascending: false })
      .order('draw_time', { ascending: false })
      .limit(limit);
    
    if (lotteryId) {
      query = query.eq('lottery_id', lotteryId);
    }
    
    if (date) {
      query = query.eq('draw_date', date);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ results: data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}