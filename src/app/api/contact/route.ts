export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    console.log(`[Contact Form] From: ${name} <${email}>: ${message}`)

    // If SMTP environment variables exist, send email notification
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: parseInt(process.env.SMTP_PORT || '587') === 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@barbershop.com',
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          subject: `New Contact Form Submission from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        })
      } catch (emailErr) {
        console.error('Failed to send contact email:', emailErr)
        // Don't fail the user request if email sending fails
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error handling contact form:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit contact form' },
      { status: 500 }
    )
  }
}
