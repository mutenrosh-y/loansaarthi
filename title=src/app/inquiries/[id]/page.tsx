import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'ARCHIVED', label: 'Archived' }
]

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [inquiry, setInquiry] = useState<Inquiry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetch(`/api/inquiries/${params.id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Not found'))
      .then(data => {
        setInquiry(data)
        setStatus(data.status)
        setNotes(data.notes || '')
      })
      .catch(() => setError('Inquiry not found'))
      .finally(() => setLoading(false))
  }, [params.id])

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/inquiries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error('Failed to update status')
      setSaveMsg('Status updated')
      setInquiry(prev => prev ? { ...prev, status: newStatus } : prev)
    } catch {
      setSaveMsg('Failed to update status')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  const handleNotesSave = async () => {
    setSaving(true)
    setSaveMsg('')
    try {
      const res = await fetch(`/api/inquiries/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      if (!res.ok) throw new Error('Failed to update notes')
      setSaveMsg('Notes saved')
      setInquiry(prev => prev ? { ...prev, notes } : prev)
    } catch {
      setSaveMsg('Failed to save notes')
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMsg(''), 2000)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6"><div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8"><div className="text-center">Loading...</div></div></div>
      </AppLayout>
    )
  }
  if (error || !inquiry) {
    return (
      <AppLayout>
        <div className="py-6"><div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8"><div className="rounded-md bg-red-50 p-4"><div className="text-sm text-red-700">{error || 'Inquiry not found'}</div></div></div></div>
      </AppLayout>
    )
  }

  // Pre-fill customer add form with query params
  const customerPrefill = {
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.mobile,
    address: `${inquiry.address1}, ${inquiry.address2}`,
    city: inquiry.city,
    state: inquiry.state,
    country: 'India'
  }
  const customerAddUrl = `/customers/add?${Object.entries(customerPrefill).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}`

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              Back to Inquiries
            </button>
            <div className="flex gap-2">
              <a href={`tel:${inquiry.mobile}`} className="btn-secondary flex items-center gap-1 text-xs">
                <PhoneIcon className="h-4 w-4" /> Call
              </a>
              <a href={`mailto:${inquiry.email}`} className="btn-secondary flex items-center gap-1 text-xs">
                <EnvelopeIcon className="h-4 w-4" /> Email
              </a>
              <Link href={customerAddUrl} className="btn-primary text-xs">Convert to Customer</Link>
            </div>
          </div>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Inquiry Details
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Submitted loan inquiry and applicant details.
                </p>
              </div>
              <div>
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                  value={status}
                  onChange={handleStatusChange}
                  disabled={saving}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {saveMsg && <span className="ml-2 text-xs text-gray-500">{saveMsg}</span>}
              </div>
            </div>
            <div className="border-t border-gray-200">
              <dl>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{inquiry.name}</dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{inquiry.status}</dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Internal Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <textarea
                      className="w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      rows={3}
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      disabled={saving}
                    />
                    <button
                      className="btn-primary mt-2"
                      onClick={handleNotesSave}
                      disabled={saving}
                      type="button"
                    >
                      Save Notes
                    </button>
                    {saveMsg && <span className="ml-2 text-xs text-gray-500">{saveMsg}</span>}
                  </dd>
                </div>
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Audit Log</dt>
                  <dd className="mt-1 text-xs text-gray-700 sm:mt-0 sm:col-span-2">
                    <div>Status: <span className="font-medium">{inquiry.status}</span></div>
                    <div>Notes last updated: <span className="font-medium">{inquiry.notes ? 'Yes' : 'No'}</span></div>
                    <div>Created: {new Date(inquiry.createdAt).toLocaleString()}</div>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
} 