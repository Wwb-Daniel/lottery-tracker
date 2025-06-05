import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://peyokcdmiligysiqxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW9rY2RtaWxpZ3lzaXF4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNjg2MzQsImV4cCI6MjA2NDY0NDYzNH0.VKK3WUSl_k0UMbO9ihEEgjf6YNs0vp5IL3Gx5GEzUCM';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);