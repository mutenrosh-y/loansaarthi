'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function AddLoanPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    interestRate: '',
    term: '',
    type: 'PERSONAL',
    purpose: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          interestRate: parseFloat(formData.interestRate),
          term: parseInt(formData.term),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create loan');
      }

      router.push('/loans');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              Back to Loans
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add New Loan
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="border-t border-gray-200">
              <div className="bg-white px-4 py-5 sm:p-6">
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                      Customer
                    </label>
                    <select
                      id="customerId"
                      name="customerId"
                      required
                      value={formData.customerId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="">Select a customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Loan Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                      <option value="PERSONAL">Personal</option>
                      <option value="BUSINESS">Business</option>
                      <option value="HOME">Home</option>
                      <option value="EDUCATION">Education</option>
                      <option value="VEHICLE">Vehicle</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      id="interestRate"
                      name="interestRate"
                      required
                      min="0"
                      step="0.01"
                      value={formData.interestRate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="term" className="block text-sm font-medium text-gray-700">
                      Term (months)
                    </label>
                    <input
                      type="number"
                      id="term"
                      name="term"
                      required
                      min="1"
                      value={formData.term}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="purpose" className="block text-sm font-medium text-gray-700">
                      Purpose
                    </label>
                    <textarea
                      id="purpose"
                      name="purpose"
                      required
                      rows={3}
                      value={formData.purpose}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Create Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 