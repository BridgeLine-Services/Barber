import { redirect } from 'next/navigation'
import MediaPage from '../media/page'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions)
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
