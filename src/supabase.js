import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fvdzdyjkwrjollhhhxaw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_dews_l-LaZKF6x3DEzsL9Q_dh1zOMVf'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
