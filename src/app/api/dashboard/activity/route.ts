import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/auth.config'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Fetch recent activity (last 10 items from loans, customers, documents)
  const [loans, customers, documents] = await Promise.all([
    prisma.loan.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { customer: true } }),
    prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.document.findMany({ orderBy: { createdAt: 'desc' }, take: 2, include: { customer: true, loan: true } }),
  ])
  const activity = [
    ...loans.map(l => ({
      type: 'loan',
      action: `Loan ${l.status.toLowerCase()}`,
      user: l.customer?.name || 'Unknown',
      time: l.createdAt,
    })),
    ...customers.map(c => ({
      type: 'customer',
      action: 'New customer registered',
      user: c.name,
      time: c.createdAt,
    })),
    ...documents.map(d => ({
      type: 'document',
      action: `Document ${d.status.toLowerCase()}`,
      user: d.customer?.name || d.loan?.id || 'Unknown',
      time: d.createdAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10)
  return NextResponse.json(activity)
} 