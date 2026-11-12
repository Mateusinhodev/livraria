import { createClient } from '@supabase/supabase-js';

// Dados do projeto em: Supabase → Project Settings → Data API / API Keys
const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !chave) {
    console.error(
        'Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env'
    );
}

export const supabase = createClient(url, chave);