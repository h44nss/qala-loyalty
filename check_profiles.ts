import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envRaw = fs.readFileSync('.env.local', 'utf8')
const env: Record<string, string> = {}
envRaw.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=')
    env[key.trim()] = rest.join('=').trim()
  }
})

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL']!,
  env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
)

async function check() {
  const { data, error } = await supabase.from('profiles').select('*')
  console.log('Profiles:', data)
  console.log('Error:', error)
}
check()
