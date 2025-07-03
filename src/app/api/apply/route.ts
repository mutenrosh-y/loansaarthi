import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const inquirySchema = z.object({
  name: z.string(),
  gender: z.enum(['Male', 'Female']),
  dobYear: z.string(),
  dobMonth: z.string(),
  dobDay: z.string(),
  mobile: z.string(),
  email: z.string(),
  pan: z.string(),
  loanAmount: z.string(),
  employmentType: z.string(),
  companyName: z.string(),
  monthlyIncome: z.string(),
  workEmail: z.string(),
  address1: z.string(),
  address2: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  otpVerified: z.boolean()
})

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const result = inquirySchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.errors }, { status: 400 })
    }
    // Store in DB (LoanInquiry model)
    const inquiry = await prisma.loanInquiry.create({ data: result.data })
    return NextResponse.json({ success: true, inquiry })
  } catch (e) {
    return NextResponse.json({ error: 'Server error', details: e instanceof Error ? e.message : e }, { status: 500 })
  }
} 