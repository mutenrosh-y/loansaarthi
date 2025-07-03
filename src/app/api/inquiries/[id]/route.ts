import { NextResponse, NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'
import prisma from '@/lib/prisma'

const STAFF_ROLES = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']

type Params = { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = params
  try {
    const inquiry = await prisma.loanInquiry.findUnique({ where: { id } })
    if (!inquiry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(inquiry)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = params
  const data = await req.json()
  try {
    const updated = await prisma.loanInquiry.update({ where: { id }, data })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 })
  }
} 