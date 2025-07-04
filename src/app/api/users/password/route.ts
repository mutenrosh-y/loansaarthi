import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/auth.config'
import prisma from '../../../../lib/prisma'
import bcrypt from 'bcryptjs'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { currentPassword, newPassword } = await request.json()
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { email: session.user.email }, data: { password: hashed } })
    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error: any) {
    console.error('Error changing password:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
} 