export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireStaff } from '@/lib/auth-helpers'
import { getBusinessIdForUser, logAudit } from '@/lib/auth-helpers'
import { validateSlot } from '@/lib/availability'
import { updateAppointmentSchema, isValidTransition, isTerminalStatus } from '@/lib/validation'
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit'

interface RouteParams {
  params: { id: string }
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await requireStaff({ restrictToOwnBarber: true })
  if (!auth.success) return auth.response

  const user = auth.user

  try {
    const businessId = await getBusinessIdForUser(user)

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId, // multi-tenant isolation
      },
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // ROLE ENFORCEMENT: Barbers can only view their own appointments
    if (user.role === 'BARBER' && user.barberId && appointment.barberId !== user.barberId) {
      return NextResponse.json(
        { error: 'You can only view your own appointments' },
        { status: 403 }
      )
    }

    return NextResponse.json(appointment)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await requireStaff({ restrictToOwnBarber: true })
  if (!auth.success) return auth.response

  const user = auth.user

  // Rate limit
  const rl = checkRateLimit(req, 'dashboard-appt-update', RATE_LIMITS.DASHBOARD)
  if (rl) return NextResponse.json({ error: rl.body.error }, { status: rl.status })

  try {
    const businessId = await getBusinessIdForUser(user)

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        businessId,
      },
      include: {
        service: true,
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    // ROLE ENFORCEMENT: Barbers can only modify their own appointments
    if (user.role === 'BARBER' && user.barberId && appointment.barberId !== user.barberId) {
      return NextResponse.json(
        { error: 'You can only modify your own appointments' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validate with Zod
    const parseResult = updateAppointmentSchema.safeParse(body)
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { status, startTime: newStartTimeIso, cancellationReason } = parseResult.data

    // STATE MACHINE: Check valid transitions
    if (status && status !== appointment.status) {
      if (isTerminalStatus(appointment.status)) {
        return NextResponse.json(
          { error: `Cannot change a ${appointment.status.toLowerCase()} appointment` },
          { status: 409 }
        )
      }
      // Allow owner to force transitions (with override flag)
      const forceOverride = body._forceOverride === true && user.role === 'OWNER'
      if (!forceOverride && !isValidTransition(appointment.status, status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${appointment.status} to ${status}` },
          { status: 409 }
        )
      }
    }

    const updateData: any = {}

    if (status) {
      updateData.status = status
    }

    if (cancellationReason !== undefined) {
      updateData.cancellationReason = cancellationReason
    }

    // RESCHEDULE: Use canonical validateSlot for full validation
    if (newStartTimeIso) {
      const newStart = new Date(newStartTimeIso)
      if (isNaN(newStart.getTime())) {
        return NextResponse.json({ error: 'Invalid start time' }, { status: 400 })
      }

      // Cannot reschedule to the past
      if (newStart < new Date()) {
        return NextResponse.json({ error: 'Cannot reschedule to a past time' }, { status: 400 })
      }

      // Use the canonical validation — same rules as initial booking
      const validation = await validateSlot({
        businessId,
        barberId: appointment.barberId,
        serviceId: appointment.serviceId,
        startTime: newStart,
        excludeAppointmentId: appointment.id, // exclude self
      })

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Selected time is not available' },
          { status: 409 }
        )
      }

      updateData.startTime = newStart
      updateData.endTime = validation.endTime
      if (!status) {
        updateData.status = 'RESCHEDULED'
      }
    }

    // Capture old values for audit log
    const oldValues = {
      status: appointment.status,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      cancellationReason: appointment.cancellationReason,
    }

    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        barber: true,
        service: true,
      },
    })

    // Log audit event
    const actionMap: Record<string, any> = {
      CANCELLED: 'APPOINTMENT_CANCELLED',
      COMPLETED: 'APPOINTMENT_COMPLETED',
      NO_SHOW: 'APPOINTMENT_NO_SHOW',
      RESCHEDULED: 'APPOINTMENT_RESCHEDULED',
    }
    const auditAction = actionMap[updateData.status] || 'APPOINTMENT_RESCHEDULED'
    await logAudit({
      userId: user.id,
      businessId,
      action: auditAction,
      entityType: 'Appointment',
      entityId: params.id,
      oldValues,
      newValues: updateData,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
