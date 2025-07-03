"use client";

import { useState } from 'react'
import { z } from 'zod'

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)
const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
const days = Array.from({ length: 31 }, (_, i) => i + 1)

const step1Schema = z.object({
  name: z.string().min(2, 'Name is required'),
  gender: z.enum(['Male', 'Female']),
  dobYear: z.string(),
  dobMonth: z.string(),
  dobDay: z.string(),
  mobile: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number'),
  email: z.string().email('Enter a valid email'),
  pan: z.string().regex(panRegex, 'Invalid PAN format'),
  loanAmount: z.string().min(1, 'Loan amount required'),
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
    addressLine1: '',
    addressLine2: '',
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        {/* Stepper */}
        <div className="flex border-b mb-8">
          <div className={`flex-1 text-center py-2 font-semibold ${step === 1 ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-400'}`}>Personal Details</div>
          <div className={`flex-1 text-center py-2 font-semibold ${step === 2 ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-400'}`}>Employment Details</div>
          <div className={`flex-1 text-center py-2 font-semibold ${step === 3 ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-400'}`}>Address Details</div>
        </div>
        {step === 1 && (
          <form onSubmit={e => e.preventDefault()} className="space-y-5">
            {/* Gender */}
            <label className="block font-bold text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mb-2">
              <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'Male' }))} className={`flex-1 py-2 rounded border ${form.gender === 'Male' ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white font-bold' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>Male</button>
              <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'Female' }))} className={`flex-1 py-2 rounded border ${form.gender === 'Female' ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white font-bold' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>Female</button>
            </div>
            {/* DOB */}
            <label className="block font-bold text-gray-700 mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <div className="flex gap-2 mb-2">
              <select name="dobYear" value={form.dobYear} onChange={handleChange} className="input w-1/3">
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select name="dobMonth" value={form.dobMonth} onChange={handleChange} className="input w-1/3">
                <option value="">Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="dobDay" value={form.dobDay} onChange={handleChange} className="input w-1/3">
                <option value="">Day</option>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Name */}
            <label className="block font-bold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="input w-full" />
            {/* Mobile */}
            <label className="block font-bold text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="input w-full" />
            {/* Email */}
            <label className="block font-bold text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input w-full" />
            {/* PAN */}
            <label className="block font-bold text-gray-700 mb-1">Pan Card <span className="text-red-500">*</span></label>
            <input
              name="pan"
              value={form.pan}
              onChange={handleChange}
              onBlur={handlePanBlur}
              placeholder="PAN Card"
              className="input w-full uppercase"
              maxLength={10}
            />
            {panError && <div className="text-red-600 text-xs text-center">{panError}</div>}
            {/* Loan Amount */}
            <label className="block font-bold text-gray-700 mb-1">Requested Loan Amount <span className="text-red-500">*</span></label>
            <input
              name="loanAmount"
              value={form.loanAmount}
              onChange={handleChange}
              placeholder="₹ 50,000"
              className="input w-full"
            />
            {/* OTP */}
            {!otpSent ? (
              <button type="button" className="w-full py-2 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow" onClick={handleSendOtp} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            ) : !otpVerified ? (
              <div className="space-y-2">
                <input name="otp" value={form.otp} onChange={handleChange} placeholder="Enter OTP" className="input w-full" />
                <button type="button" className="w-full py-2 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                {devOtp && <div className="text-xs text-blue-500 text-center">Dev OTP: <span className="font-mono">{devOtp}</span></div>}
              </div>
            ) : (
              <div className="text-green-600 text-center">Mobile number verified!</div>
            )}
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            {/* Next Step Placeholder */}
            {/* <button type="submit" className="w-full py-2 rounded bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold shadow mt-4">Next</button> */}
          </form>
        )}
        {step === 2 && (
          <div className="text-center">Step 2 coming soon...</div>
        )}
      </div>
    </div>
  )
} 