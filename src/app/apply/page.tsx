"use client";

import { useState } from 'react'
import { z } from 'zod'

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const days = Array.from({ length: 31 }, (_, i) => i + 1)

const employmentTypes = [
  'Salaried',
  'Self-Employed',
  'Business Owner',
  'Student',
  'Retired',
  'Other',
]

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  gender: z.enum(['Male', 'Female']),
  dobYear: z.string(),
  dobMonth: z.string(),
  dobDay: z.string(),
  mobile: z.string().regex(/^[\d]{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email'),
  pan: z.string().regex(panRegex, 'Invalid PAN format'),
  loanAmount: z.string().min(1, 'Loan amount required'),
})

const step2Schema = z.object({
  employmentType: z.string().min(2, 'Employment type required'),
  companyName: z.string().min(2, 'Company name required'),
  monthlyIncome: z.string().min(1, 'Monthly income required'),
  workEmail: z.string().email('Enter a valid work email'),
})

const step3Schema = z.object({
  address1: z.string().min(2, 'Address required'),
  address2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().min(5, 'Pincode required'),
})

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    gender: 'Male',
    dobYear: '',
    dobMonth: '',
    dobDay: '',
    mobile: '',
    email: '',
    pan: '',
    loanAmount: '',
    otp: '',
    employmentType: '',
    companyName: '',
    monthlyIncome: '',
    workEmail: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [panError, setPanError] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'pan') setPanError('')
    if (e.target.name === 'loanAmount') {
      // Format as currency
      const raw = e.target.value.replace(/[^\d]/g, '')
      setForm(f => ({ ...f, loanAmount: raw ? Number(raw).toLocaleString('en-IN') : '' }))
    }
  }

  const handlePanBlur = () => {
    if (form.pan && !panRegex.test(form.pan)) setPanError('Invalid PAN format')
    else setPanError('')
  }

  const handleSendOtp = async () => {
    setError('')
    const result = step1Schema.safeParse(form)
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: form.mobile })
      })
      const data = await res.json()
      setOtpSent(true)
      setLoading(false)
      if (data.otp) setDevOtp(data.otp)
    } catch (e) {
      setError('Failed to send OTP')
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (!form.otp) {
      setError('Enter OTP')
      return
    }
    setLoading(true)
    // TODO: Call /api/otp/verify with form.mobile and form.otp
    setTimeout(() => {
      setOtpVerified(true)
      setLoading(false)
      setStep(2)
    }, 1000)
  }

  const handleNextStep = async () => {
    setError('')
    if (step === 1) {
      const result = step1Schema.safeParse(form)
      if (!result.success) {
        setError(result.error.errors[0].message)
        return
      }
      if (!otpVerified) {
        setError('Please verify your mobile number')
        return
      }
      setStep(2)
    } else if (step === 2) {
      const result = step2Schema.safeParse(form)
      if (!result.success) {
        setError(result.error.errors[0].message)
        return
      }
      setStep(3)
    }
  }

  const handlePrevStep = () => {
    setError('')
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setSubmitError('')
    setError('')
    const s1 = step1Schema.safeParse(form)
    const s2 = step2Schema.safeParse(form)
    const s3 = step3Schema.safeParse(form)
    if (!s1.success) {
      setStep(1)
      setError(s1.error.errors[0].message)
      return
    }
    if (!s2.success) {
      setStep(2)
      setError(s2.error.errors[0].message)
      return
    }
    if (!s3.success) {
      setStep(3)
      setError(s3.error.errors[0].message)
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          loanAmount: form.loanAmount.replace(/[^\d.]/g, ''),
          monthlyIncome: form.monthlyIncome.replace(/[^\d.]/g, ''),
          otpVerified: true,
        })
      })
      if (res.ok) {
        setSuccess(true)
        setForm({
          name: '', gender: 'Male', dobYear: '', dobMonth: '', dobDay: '', mobile: '', email: '', pan: '', loanAmount: '', otp: '', employmentType: '', companyName: '', monthlyIncome: '', workEmail: '', address1: '', address2: '', city: '', state: '', pincode: '',
        })
        setStep(1)
        setOtpSent(false)
        setOtpVerified(false)
        setDevOtp('')
      } else {
        const data = await res.json()
        setSubmitError(data.error || 'Failed to submit application')
      }
    } catch (e) {
      setSubmitError('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-8">
        <div className="w-full max-w-2xl card text-center py-16">
          <div className="text-3xl font-bold text-green-600 mb-4">Application Submitted!</div>
          <div className="text-lg text-gray-700 mb-6">Thank you for applying. Our team will review your application and contact you soon.</div>
          <button className="btn-primary" onClick={() => setSuccess(false)}>Apply for another loan</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <span className="inline-block text-3xl font-extrabold text-blue-600 tracking-tight">LoanSaarthi</span>
          <div className="mt-2 text-lg text-gray-500 font-medium">Apply for a Loan</div>
        </div>
        <div className="card">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center">
                <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-white ${step === s ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'}`}>{s}</div>
                <div className={`mt-2 text-xs font-semibold ${step === s ? 'text-blue-600' : 'text-gray-400'}`}>{['Personal', 'Employment', 'Address'][i]}</div>
                {i < 2 && <div className={`h-1 w-12 ${step > s ? 'bg-blue-600' : 'bg-gray-200'} mt-2 rounded`}></div>}
              </div>
            ))}
          </div>
          {step === 1 && (
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              {/* Gender */}
              <label className="form-label">Gender <span className="text-red-500">*</span></label>
              <div className="flex gap-4 mb-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'Male' }))} className={`flex-1 btn-secondary ${form.gender === 'Male' ? 'bg-blue-600 text-white font-bold' : ''}`}>Male</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'Female' }))} className={`flex-1 btn-secondary ${form.gender === 'Female' ? 'bg-pink-500 text-white font-bold' : ''}`}>Female</button>
              </div>
              {/* DOB */}
              <label className="form-label">Date of Birth <span className="text-red-500">*</span></label>
              <div className="flex gap-2 mb-2">
                <select name="dobYear" value={form.dobYear} onChange={handleChange} className="form-input w-1/3">
                  <option value="">Year</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select name="dobMonth" value={form.dobMonth} onChange={handleChange} className="form-input w-1/3">
                  <option value="">Month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="dobDay" value={form.dobDay} onChange={handleChange} className="form-input w-1/3">
                  <option value="">Day</option>
                  {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              {/* Name */}
              <label className="form-label">Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="form-input w-full" />
              {/* Mobile */}
              <label className="form-label">Mobile Number <span className="text-red-500">*</span></label>
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="form-input w-full" />
              {/* Email */}
              <label className="form-label">Email <span className="text-red-500">*</span></label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="form-input w-full" />
              {/* PAN */}
              <label className="form-label">Pan Card <span className="text-red-500">*</span></label>
              <input
                name="pan"
                value={form.pan}
                onChange={handleChange}
                onBlur={handlePanBlur}
                placeholder="PAN Card"
                className="form-input w-full uppercase"
                maxLength={10}
              />
              {panError && <div className="text-red-600 text-xs text-center">{panError}</div>}
              {/* Loan Amount */}
              <label className="form-label">Requested Loan Amount <span className="text-red-500">*</span></label>
              <input
                name="loanAmount"
                value={form.loanAmount}
                onChange={handleChange}
                placeholder="₹ 50,000"
                className="form-input w-full"
              />
              {/* OTP */}
              {!otpSent ? (
                <button type="button" className="btn-primary w-full" onClick={handleSendOtp} disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              ) : !otpVerified ? (
                <div className="space-y-2">
                  <input name="otp" value={form.otp} onChange={handleChange} placeholder="Enter OTP" className="form-input w-full" />
                  <button type="button" className="btn-primary w-full" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  {devOtp && <div className="text-xs text-blue-500 text-center">Dev OTP: <span className="font-mono">{devOtp}</span></div>}
                </div>
              ) : (
                <div className="text-green-600 text-center">Mobile number verified!</div>
              )}
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={handleNextStep}>Next</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              <label className="form-label">Employment Type <span className="text-red-500">*</span></label>
              <select name="employmentType" value={form.employmentType} onChange={handleChange} className="form-input w-full">
                <option value="">Select</option>
                {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <label className="form-label">Company Name <span className="text-red-500">*</span></label>
              <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className="form-input w-full" />
              <label className="form-label">Monthly Income <span className="text-red-500">*</span></label>
              <input name="monthlyIncome" value={form.monthlyIncome} onChange={handleChange} placeholder="₹ 50,000" className="form-input w-full" />
              <label className="form-label">Work Email <span className="text-red-500">*</span></label>
              <input name="workEmail" value={form.workEmail} onChange={handleChange} placeholder="Work Email" className="form-input w-full" />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              <div className="flex justify-between gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Back</button>
                <button type="button" className="btn-primary" onClick={handleNextStep}>Next</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form onSubmit={e => e.preventDefault()} className="space-y-5">
              <label className="form-label">Address Line 1 <span className="text-red-500">*</span></label>
              <input name="address1" value={form.address1} onChange={handleChange} placeholder="Address Line 1" className="form-input w-full" />
              <label className="form-label">Address Line 2</label>
              <input name="address2" value={form.address2} onChange={handleChange} placeholder="Address Line 2" className="form-input w-full" />
              <label className="form-label">City <span className="text-red-500">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="form-input w-full" />
              <label className="form-label">State <span className="text-red-500">*</span></label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="State" className="form-input w-full" />
              <label className="form-label">Pincode <span className="text-red-500">*</span></label>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="Pincode" className="form-input w-full" />
              {error && <div className="text-red-600 text-sm text-center">{error}</div>}
              {submitError && <div className="text-red-600 text-sm text-center">{submitError}</div>}
              <div className="flex justify-between gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={handlePrevStep}>Back</button>
                <button type="button" className="btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 