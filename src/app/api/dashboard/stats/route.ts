import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient, LoanStatus } from '@prisma/client';
import { authOptions } from '../../auth/auth.config';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Role-based filtering can be added here
  const [
    totalCustomers,
    totalLoans,
    pendingLoans,
    approvedLoans,
    totalDocuments,
    pendingDocuments,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.loan.count(),
    prisma.loan.count({ where: { status: LoanStatus.PENDING } }),
    prisma.loan.count({ where: { status: LoanStatus.APPROVED } }),
    prisma.document.count(),
    prisma.document.count({ where: { status: 'PENDING' } }),
  ]);
  // Revenue data: sum of disbursed loans per month (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }).reverse();
  const revenueData = await Promise.all(months.map(async ({ year, month }) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    const amount = await prisma.loan.aggregate({
      _sum: { amount: true },
      where: { status: LoanStatus.DISBURSED, disbursedDate: { gte: start, lt: end } },
    });
    return { month: `${start.toLocaleString('default', { month: 'short' })}`, amount: amount._sum?.amount || 0 };
  }));
  return NextResponse.json({
    totalCustomers,
    totalLoans,
    pendingLoans,
    approvedLoans,
    totalDocuments,
    pendingDocuments,
    revenueData,
    // Add more role-based stats here
  });
} 