import { createClient } from '@supabase/supabase-js'

// 使用环境变量获取 Supabase 配置
// 在 Vercel 中设置以下环境变量：
// - VITE_SUPABASE_URL
// - VITE_SUPABASE_ANON_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kyjsitwmwietoqwhdaub.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Ay6_-2Qf4MLuszzlzQt__w_vCxGEKBe'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
