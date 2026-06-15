import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ebdgwgdwkwecbfutmsoc.supabase.co'
const supabaseKey = 'sb_publishable_ASWwHEKELnd_xQLWcvRQwQ_HdWjDwYN'

export const supabase = createClient(supabaseUrl, supabaseKey)