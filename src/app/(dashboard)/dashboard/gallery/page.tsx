import { redirect } from 'next/navigation'
import { getDemoSession } from '@/lib/demo-auth'
import MediaPage from '../media/page'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const session = await getDemoSession()
  if (!session?.user) redirect('/login')
  if ((session.user as { role?: string }).role !== 'OWNER') redirect('/dashboard')

  return (
    <MediaPage
      initialType="GALLERY"
      title="Shop Gallery"
      description="Manage the published photos shown in your shop gallery."
    />
  )
}
