import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from '@/components/customer/profile-client'

export default async function CustomerProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone_number, instagram_username')
    .eq('id', user.id)
    .single()

  return <ProfileClient profile={profile || { full_name: null, phone_number: null, instagram_username: null }} />
}
