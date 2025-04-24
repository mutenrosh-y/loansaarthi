'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Loan {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  tenure: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CLOSED';
  type: 'PERSONAL' | 'BUSINESS' | 'HOME' | 'EDUCATION' | 'VEHICLE';
  purpose: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  emiAmount: number;
  totalAmount: number;
}

export default function EditLoanPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLoanDetails();
  }, [params.id]);

  const fetchLoanDetails = async () => {
    try {
      const response = await fetch(`/api/loans/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch loan details');
      }
      const data = await response.json();
      setLoan(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loan) return;

    try {
      setIsSubmitting(true);
      const formData = {
        amount: loan.amount,
        interestRate: loan.interestRate,
        tenure: loan.tenure,
        type: loan.type,
        purpose: loan.purpose,
      };
      
      console.log('Submitting loan update with data:', formData);
      
      const response = await fetch(`/api/loans/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Received response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update loan');
      }

      router.push(`/loans/${params.id}`);
    } catch (error: any) {
      console.error('Error updating loan:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!loan) return;

    const { name, value } = e.target;
    setLoan({
      ...loan,
      [name]: name === 'amount' || name === 'interestRate' || name === 'tenure' ? parseFloat(value) : value,
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !loan) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error || 'Loan not found'}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => router.back()}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Loan</h1>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Loan Information</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Update the loan details. Only pending loans can be edited.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                          Loan Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={loan.type}
                          onChange={handleChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="PERSONAL">Personal</option>
                          <option value="BUSINESS">Business</option>
                          <option value="HOME">Home</option>
                          <option value="EDUCATION">Education</option>
                          <option value="VEHICLE">Vehicle</option>
                        </select>
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                          Amount
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            name="amount"
                            id="amount"
                            value={loan.amount}
                            onChange={handleChange}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                          Interest Rate (%)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="number"
                            name="interestRate"
                            id="interestRate"
                            value={loan.interestRate}
                            onChange={handleChange}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">%</span>
                          </div>
                        </div>
                      </div>

                      <div className="col-span-6 sm:col-span-4">
                        <label htmlFor="tenure" className="block text-sm font-medium text-gray-700">
                          Tenure (months)
                        </label>
                        <input
                          type="number"
                          name="tenure"
                          id="tenure"
                          value={loan.tenure}
                          onChange={handleChange}
                          className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="12"
                          min="1"
                          required
                        />
                      </div>

                      <div className="col-span-6">
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                          Purpose
                        </label>
                        <textarea
                          id="purpose"
                          name="purpose"
                          rows={3}
                          value={loan.purpose}
                          onChange={handleChange}
                          className="mt-1 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 