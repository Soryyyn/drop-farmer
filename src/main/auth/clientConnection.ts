import { createClient } from '@supabase/supabase-js';

/**
 * Create the supabase client and connect it to the backend.
 */
const supabase = createClient(
    process.env.SUPABASE_BACKEND_URL ?? '',
    process.env.SUPABASE_BACKEND_ANON_KEY ?? '',
    {
        auth: {
            autoRefreshToken: true,
            detectSessionInUrl: true,
            persistSession: true
        }
    }
);
