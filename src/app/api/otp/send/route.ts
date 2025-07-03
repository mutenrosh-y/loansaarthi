let otpStore: Record<string, string> = {}

export async function POST(req: Request) {
  const { mobile } = await req.json()
  if (!mobile || !/^\d{10}$/.test(mobile)) {
    return new Response(JSON.stringify({ error: 'Invalid mobile number' }), { status: 400 })
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  otpStore[mobile] = otp
  // TODO: Integrate with SMS provider here
  console.log(`OTP for ${mobile}: ${otp}`)
  // Return OTP in response for development/testing
  return new Response(JSON.stringify({ success: true, otp }), { status: 200 })
} 