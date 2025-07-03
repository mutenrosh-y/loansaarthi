import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/auth.config'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

const STAFF_ROLES = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']

export default async function InquiryDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    redirect('/auth/login')
  }
  const inquiry = await prisma.loanInquiry.findUnique({ where: { id: params.id } })
  if (!inquiry) notFound()

  async function markReviewed(formData: FormData) {
    'use server'
    await prisma.loanInquiry.update({ where: { id: params.id }, data: { status: 'Reviewed' } })
    revalidatePath(`/inquiries/${params.id}`)
  }

  async function updateNotes(formData: FormData) {
    'use server'
    const notes = formData.get('notes') as string
    await prisma.loanInquiry.update({ where: { id: params.id }, data: { notes } })
    revalidatePath(`/inquiries/${params.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="mb-4">
        <Link href="/inquiries" className="text-blue-600 hover:underline text-sm">&larr; Back to Inquiries</Link>
      </div>
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Inquiry Details</h1>
      <div className="bg-white rounded shadow p-6 space-y-4">
        <div><span className="font-semibold">Name:</span> {inquiry.name}</div>
        <div><span className="font-semibold">Gender:</span> {inquiry.gender}</div>
        <div><span className="font-semibold">DOB:</span> {inquiry.dobDay}-{inquiry.dobMonth}-{inquiry.dobYear}</div>
        <div><span className="font-semibold">Mobile:</span> {inquiry.mobile}</div>
        <div><span className="font-semibold">Email:</span> {inquiry.email}</div>
        <div><span className="font-semibold">PAN:</span> {inquiry.pan}</div>
        <div><span className="font-semibold">Loan Amount:</span> ₹{inquiry.loanAmount.toLocaleString('en-IN')}</div>
        <div><span className="font-semibold">Employment Type:</span> {inquiry.employmentType}</div>
        <div><span className="font-semibold">Company Name:</span> {inquiry.companyName}</div>
        <div><span className="font-semibold">Monthly Income:</span> ₹{inquiry.monthlyIncome.toLocaleString('en-IN')}</div>
        <div><span className="font-semibold">Work Email:</span> {inquiry.workEmail}</div>
        <div><span className="font-semibold">Address:</span> {inquiry.address1}, {inquiry.address2}, {inquiry.city}, {inquiry.state} - {inquiry.pincode}</div>
        <div><span className="font-semibold">Created:</span> {new Date(inquiry.createdAt).toLocaleString()}</div>
        <div><span className="font-semibold">Status:</span> {inquiry.status}</div>
        <form action={markReviewed} className="mt-4">
          <button type="submit" className="btn-primary" disabled={inquiry.status === 'Reviewed'}>
            {inquiry.status === 'Reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
          </button>
        </form>
        <form action={updateNotes} className="mt-4 space-y-2">
          <label className="form-label">Internal Notes</label>
          <textarea name="notes" defaultValue={inquiry.notes || ''} className="form-input w-full min-h-[80px]" />
          <button type="submit" className="btn-secondary">Save Notes</button>
        </form>
      </div>
    </div>
  )
} 