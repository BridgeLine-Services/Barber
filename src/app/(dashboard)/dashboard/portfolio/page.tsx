import { redirect } from 'next/navigation'
import MediaPage from '../media/page'
import { getDemoSession } from '@/lib/demo-auth'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const session = await getDemoSession()
  if (!session || (session.user as { role?: string }).role !== 'BARBER') {
    redirect('/dashboard')
  }

  return (
    <MediaPage
      initialType="BARBER_PORTFOLIO"
      title="My Work"
      description="Upload and manage the published work shown on your barber profile."
    />
  )
}
