import { createClient } from '@/lib/supabase/server'
import { CustomersClient } from '@/components/admin/customers-client'

export const dynamic = 'force-dynamic'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  return <CustomersClient initialCustomers={customers || []} />
}
