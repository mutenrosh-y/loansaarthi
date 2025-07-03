import { NextResponse } from 'next/server'

let otpStore: Record<string, string> = {}

export async function POST(req: Request) {
  const { mobile, otp } = await req.json()
  if (!mobile || !otp) {
    return NextResponse.json({ error: 'Missing mobile or OTP' }, { status: 400 })
  }
  if (otpStore[mobile] === otp) {
    delete otpStore[mobile]
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
} 