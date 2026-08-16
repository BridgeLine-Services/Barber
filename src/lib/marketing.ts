import { prisma } from '@/lib/prisma'

// ============================================================================
// Marketing Automation Engine
// Owner creates targeted campaigns based on customer segments.
// Audiences: inactive 30/45/60/90 days, not rebooked, cancelled, no-showed,
// birthday month, haven't visited a barber, used a specific service.
// ============================================================================

export interface CampaignTarget {
  customerId: string
  firstName: string
  lastName: string
  phone: string
  email: string
  reason: string // why they matched this audience
}

/**
 * Resolve a campaign audience to a list of targeted customers.
 */
export async function resolveCampaignAudience(
  businessId: string,
  audience: string,
  audienceConfig?: {
    barberId?: string
    serviceId?: string
  }
): Promise<CampaignTarget[]> {
  const now = new Date()
  const targets: CampaignTarget[] = []

  // Base query: all customers for this business
  const customers = await prisma.customer.findMany({
    where: { businessId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      appointments: {
        include: {
          barber: { select: { id: true, name: true } },
          service: { select: { id: true, name: true } },
        },
        orderBy: { startTime: 'desc' },
      },
    },
  })

  for (const customer of customers) {
    const appts = customer.appointments
    const completedAppts = appts.filter(a => a.status === 'COMPLETED')
    const lastAppt = completedAppts[0]
    const lastApptDate = lastAppt ? new Date(lastAppt.startTime) : null
    const daysSinceLast = lastApptDate
      ? Math.floor((now.getTime() - lastApptDate.getTime()) / (1000 * 60 * 60 * 24))
      : null

    let matches = false
    let reason = ''

    switch (audience) {
      case 'INACTIVE_30':
        matches = daysSinceLast !== null && daysSinceLast >= 30
        reason = `Inactive for ${daysSinceLast} days`
        break

      case 'INACTIVE_45':
        matches = daysSinceLast !== null && daysSinceLast >= 45
        reason = `Inactive for ${daysSinceLast} days`
        break

      case 'INACTIVE_60':
        matches = daysSinceLast !== null && daysSinceLast >= 60
        reason = `Inactive for ${daysSinceLast} days`
        break

      case 'INACTIVE_90':
        matches = daysSinceLast !== null && daysSinceLast >= 90
        reason = `Inactive for ${daysSinceLast} days`
        break

      case 'NOT_REBOOKED':
        // Has completed appointments but no pending/confirmed future ones
        matches = completedAppts.length > 0 && !appts.some(a =>
          ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.startTime) > now
        )
        reason = 'Has not rebooked after last visit'
        break

      case 'CANCELLED':
        matches = appts.some(a => a.status === 'CANCELLED')
        reason = 'Has cancelled an appointment'
        break

      case 'NO_SHOWED':
        matches = appts.some(a => a.status === 'NO_SHOW')
        reason = 'Has no-showed an appointment'
        break

      case 'BIRTHDAY_MONTH':
        // Would need birthday field on customer — check if we have it
        // For now, skip if no birthday field exists
        matches = false
        reason = 'Birthday this month'
        break

      case 'NOT_VISITED_BARBER': {
        const barberId = audienceConfig?.barberId
        if (barberId) {
          matches = completedAppts.length > 0 && !completedAppts.some(a => a.barber?.id === barberId)
          const barber = await prisma.barber.findUnique({ where: { id: barberId }, select: { name: true } })
          reason = `Hasn't visited ${barber?.name || 'this barber'}`
        }
        break
      }

      case 'USED_SERVICE': {
        const serviceId = audienceConfig?.serviceId
        if (serviceId) {
          matches = completedAppts.some(a => a.service?.id === serviceId)
          const service = await prisma.service.findUnique({ where: { id: serviceId }, select: { name: true } })
          reason = `Has used ${service?.name || 'this service'}`
        }
        break
      }

      case 'ALL_CUSTOMERS':
        matches = true
        reason = 'All customers'
        break
    }

    if (matches) {
      targets.push({
        customerId: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        reason,
      })
    }
  }

  return targets
}

/**
 * Create a marketing campaign record.
 */
export async function createCampaign(businessId: string, data: {
  name: string
  subject: string
  body: string
  audience: string
  audienceConfig?: any
  createdBy?: string
}) {
  const campaign = await prisma.marketingCampaign.create({
    data: {
      businessId,
      name: data.name,
      subject: data.subject,
      body: data.body,
      audience: data.audience as any,
      audienceConfig: data.audienceConfig || undefined,
      status: 'DRAFT',
    },
  })

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        businessId,
        userId: data.createdBy,
        action: 'CAMPAIGN_CREATED',
        entityType: 'MarketingCampaign',
        entityId: campaign.id,
        newValues: { name: data.name, audience: data.audience },
      },
    })
  } catch (e) {
    // Non-critical
  }

  return campaign
}

/**
 * Send a campaign to all matching customers.
 */
export async function sendCampaign(businessId: string, campaignId: string) {
  const campaign = await prisma.marketingCampaign.findFirst({
    where: { id: campaignId, businessId },
  })

  if (!campaign) throw new Error('Campaign not found')

  const targets = await resolveCampaignAudience(businessId, campaign.audience, campaign.audienceConfig as any)

  // Log each notification
  for (const target of targets) {
    try {
      await prisma.notificationLog.create({
        data: {
          appointmentId: null,
          channel: 'SMS',
          type: 'MARKETING_CAMPAIGN',
          recipient: target.phone,
          content: `${campaign.subject}\n\n${campaign.body}`,
          status: 'PENDING',
          businessId,
        },
      })
    } catch (e) {
      // Non-critical — continue sending to others
    }
  }

  // Update campaign status
  await prisma.marketingCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      recipientCount: targets.length,
    },
  })

  // Audit log
  try {
    await prisma.auditLog.create({
      data: {
        businessId,
        action: 'CAMPAIGN_SENT',
        entityType: 'MarketingCampaign',
        entityId: campaignId,
        newValues: { recipientCount: targets.length },
      },
    })
  } catch (e) {
    // Non-critical
  }

  return { sent: targets.length }
}
