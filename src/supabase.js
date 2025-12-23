import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kyjsitwmwietoqwhdaub.supabase.co'
const supabaseAnonKey = 'sb_publishable_Ay6_-2Qf4MLuszzlzQt__w_vCxGEKBe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
