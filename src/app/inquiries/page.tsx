import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/auth.config'
import prisma from '@/lib/prisma'
import Link from 'next/link'

const STAFF_ROLES = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER']

export default async function InquiriesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !STAFF_ROLES.includes(session.user.role)) {
    return <div className="text-center text-red-600 py-16">Unauthorized</div>
  }
  const inquiries = await prisma.loanInquiry.findMany({ orderBy: { createdAt: 'desc' } })
  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">Loan Inquiries</h1>
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Mobile</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Loan Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.map(inquiry => (
              <tr key={inquiry.id} className="hover:bg-blue-50">
                <td className="px-4 py-2 text-sm">{inquiry.name}</td>
                <td className="px-4 py-2 text-sm">{inquiry.mobile}</td>
                <td className="px-4 py-2 text-sm">₹{inquiry.loanAmount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/inquiries/${inquiry.id}`} className="btn-secondary text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 