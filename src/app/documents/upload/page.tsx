'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import AppLayout from '@/components/layout/AppLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface Loan {
  id: string;
  customerId: string;
  status: string;
  type: string;
  amount: number;
}

export default function DocumentUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoan, setSelectedLoan] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);

  // Fetch customers when component mounts
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch loans when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      fetchLoans(selectedCustomer);
    } else {
      setLoans([]);
      setSelectedLoan('');
    }
  }, [selectedCustomer]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    }
  };

  const fetchLoans = async (customerId: string) => {
    setLoadingLoans(true);
    setLoanError(null);
    setLoans([]);
    setSelectedLoan('');
    
    try {
      console.log('Fetching loans for customer:', customerId);
      const response = await fetch(`/api/customers/${customerId}/loans`);
      const data = await response.json();

      if (!response.ok) {
        console.error('Failed to fetch loans:', data);
        throw new Error(data.error || data.details || 'Failed to fetch loans');
      }

      console.log('Successfully fetched loans:', data);
      setLoans(data);
    } catch (err) {
      console.error('Error in fetchLoans:', err);
      setLoanError(err instanceof Error ? err.message : 'Failed to fetch loans');
      
      // Retry once after a short delay
      setTimeout(async () => {
        try {
          console.log('Retrying loan fetch for customer:', customerId);
          const retryResponse = await fetch(`/api/customers/${customerId}/loans`);
          const retryData = await retryResponse.json();

          if (!retryResponse.ok) {
            console.error('Retry failed to fetch loans:', retryData);
            return;
          }

          console.log('Retry successful, fetched loans:', retryData);
          setLoans(retryData);
          setLoanError(null);
        } catch (retryErr) {
          console.error('Error in retry fetchLoans:', retryErr);
        }
      }, 2000);
    } finally {
      setLoadingLoans(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const handleUpload = async () => {
    if (!file || !selectedCustomer || !documentType) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('customerId', selectedCustomer);
      if (selectedLoan) {
        formData.append('loanId', selectedLoan);
      }
      formData.append('documentType', documentType);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      router.push(`/documents/${data.document.id}`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => router.back()}
              className="btn-secondary inline-flex items-center"
            >
              <ArrowLeftIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              Back to Documents
            </button>
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Upload Document
              </h3>
              
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                    Customer
                  </label>
                  <select
                    id="customer"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="loan" className="block text-sm font-medium text-gray-700">
                    Associated Loan (Optional)
                  </label>
                  <select
                    id="loan"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={selectedLoan}
                    onChange={(e) => setSelectedLoan(e.target.value)}
                    disabled={!selectedCustomer || loadingLoans}
                  >
                    <option value="">
                      {loadingLoans 
                        ? 'Loading loans...' 
                        : loans.length === 0 
                          ? 'No loans found' 
                          : 'Select Loan'}
                    </option>
                    {loans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        {loan.type} Loan - ₹{loan.amount.toLocaleString()} ({loan.status})
                      </option>
                    ))}
                  </select>
                  {loanError && (
                    <p className="mt-2 text-sm text-red-600">
                      {loanError}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="">Select Type</option>
                    <option value="identity">Identity Proof</option>
                    <option value="address">Address Proof</option>
                    <option value="income">Income Proof</option>
                    <option value="bank">Bank Statement</option>
                    <option value="property">Property Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Document File
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                      isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <input {...getInputProps()} />
                      {file ? (
                        <div>
                          <p className="text-sm text-gray-600">Selected file:</p>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                            aria-hidden="true"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <p className="mt-1 text-sm text-gray-600">
                            Drag and drop a file here, or click to select
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            PDF, PNG, JPG up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
                      <div className="mt-2 text-sm text-red-700">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="btn-secondary mr-3"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={loading || !file || !selectedCustomer || !documentType}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 