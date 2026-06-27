// force-dynamic prevents pre-rendering — NEXT_PUBLIC_ vars are only available at runtime
export const dynamic = 'force-dynamic'

import { RedeemRewardClient } from '@/components/admin/redeem-reward-client'

export default function RedeemRewardPage() {
  return <RedeemRewardClient />
}
