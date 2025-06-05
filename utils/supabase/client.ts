import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  if (supabaseInstance) {
    console.log('Reutilizando instancia existente de Supabase');
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Configuración de Supabase:');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key presente:', !!supabaseAnonKey);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Variables de entorno faltantes:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Presente' : 'Faltante');
    throw new Error('Missing Supabase environment variables');
  }

  // Asegurarse de que la URL comience con https://
  const url = supabaseUrl.startsWith('https://') ? supabaseUrl : `https://${supabaseUrl}`;
  console.log('URL final:', url);

  try {
    supabaseInstance = createSupabaseClient(url, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'lottery-app-storage-key' // Clave única para esta aplicación
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'lottery-app'
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    // Verificar la conexión
    supabaseInstance.from('lottery_results').select('count').limit(1)
      .then(() => {
        console.log('Conexión a Supabase verificada exitosamente');
      })
      .catch((error) => {
        console.error('Error al verificar la conexión:', error);
        throw error;
      });

    return supabaseInstance;
  } catch (error) {
    console.error('Error al crear el cliente de Supabase:', error);
    throw error;
  }
}; 