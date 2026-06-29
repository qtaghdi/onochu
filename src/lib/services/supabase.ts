import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

const url = PUBLIC_SUPABASE_URL;
const anonKey = PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurationError =
  !url || !anonKey
    ? 'Supabase 환경변수가 설정되지 않았습니다. PUBLIC_SUPABASE_URL과 PUBLIC_SUPABASE_ANON_KEY를 확인해 주세요.'
    : null;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
