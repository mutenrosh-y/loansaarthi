import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/auth.config'
import prisma from '../../../../lib/prisma'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
    }
    const { userId, newRole } = await request.json()
    const allowedRoles = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE']
    if (!userId || !newRole || !allowedRoles.includes(newRole)) {
      return NextResponse.json({ error: 'Invalid userId or role' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    await prisma.user.update({ where: { id: userId }, data: { role: newRole } })
    return NextResponse.json({ message: 'User role updated successfully' })
  } catch (error: any) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 })
  }
} 