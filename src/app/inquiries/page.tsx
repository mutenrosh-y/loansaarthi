'use client'

import { useState, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import { MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Inquiry {
  id: string
  name: string
  mobile: string
  loanAmount: number
  status: string
  createdAt: string
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'ARCHIVED', label: 'Archived' },
]

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchInquiries()
  }, [])

  const fetchInquiries = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/inquiries')
      if (!res.ok) throw new Error('Failed to fetch inquiries')
      const data = await res.json()
      setInquiries(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.mobile.includes(searchTerm)
    const matchesStatus =
      statusFilter === 'all' || inquiry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Loan Inquiries</h1>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="py-12 text-center text-gray-500">Loading...</div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-gray-500">No inquiries found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInquiries.map(inquiry => (
                      <tr key={inquiry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{inquiry.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{inquiry.mobile}</td>
                        <td className="px-6 py-4 whitespace-nowrap">₹{inquiry.loanAmount.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{new Date(inquiry.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <Link href={`/inquiries/${inquiry.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-900">
                            <EyeIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 