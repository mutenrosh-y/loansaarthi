import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/auth.config'
import prisma from '@/lib/prisma'

const STAFF_ROLES = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const inquiries = await prisma.loanInquiry.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(inquiries)
  } catch (error) {
    console.error('Error fetching loan inquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch loan inquiries' }, { status: 500 })
  }
} 