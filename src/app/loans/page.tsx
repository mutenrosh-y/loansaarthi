'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Loan {
  id: string;
  customerName: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
  emi: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed';
  applicationDate: string;
}

const MOCK_LOANS: Loan[] = [
  {
    id: 'LOAN001',
    customerName: 'John Doe',
    loanAmount: 200000,
    interestRate: 8.5,
    tenure: 24,
    emi: 9083,
    status: 'approved',
    applicationDate: '2023-01-10',
  },
  {
    id: 'LOAN002',
    customerName: 'Jane Smith',
    loanAmount: 500000,
    interestRate: 7.8,
    tenure: 36,
    emi: 15640,
    status: 'disbursed',
    applicationDate: '2023-02-15',
  },
  {
    id: 'LOAN003',
    customerName: 'Amit Patel',
    loanAmount: 100000,
    interestRate: 9.2,
    tenure: 12,
    emi: 8749,
    status: 'pending',
    applicationDate: '2023-03-20',
  },
  {
    id: 'LOAN004',
    customerName: 'Priya Singh',
    loanAmount: 300000,
    interestRate: 8.9,
    tenure: 48,
    emi: 7484,
    status: 'rejected',
    applicationDate: '2023-02-05',
  },
  {
    id: 'LOAN005',
    customerName: 'Rajesh Kumar',
    loanAmount: 1000000,
    interestRate: 7.5,
    tenure: 60,
    emi: 20036,
    status: 'disbursed',
    applicationDate: '2023-01-25',
  },
];

export default function LoansPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredLoans = MOCK_LOANS.filter(loan => {
    const matchesSearch = 
      loan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'disbursed':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Loans</h1>
            <Link href="/loans/new" className="btn-primary inline-flex items-center">
              <PlusIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              New Loan Application
            </Link>
          </div>
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search by loan ID or customer name..."
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full sm:w-48">
                <select
                  className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loan ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Term
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      EMI
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoans.length > 0 ? (
                    filteredLoans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{loan.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{loan.customerName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatCurrency(loan.loanAmount)}
                          <div className="text-gray-500 text-xs">{loan.interestRate}% p.a.</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {loan.tenure} months
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {formatCurrency(loan.emi)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(loan.status)}`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {loan.applicationDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/loans/${loan.id}`} className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            </Link>
                            {loan.status === 'pending' && (
                              <>
                                <Link href={`/loans/${loan.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                                <button className="text-green-600 hover:text-green-900">
                                  <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                                </button>
                              </>
                            )}
                            {loan.status === 'approved' && (
                              <button className="text-green-600 hover:text-green-900">
                                <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No loans found. Try adjusting your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{filteredLoans.length}</span> of{' '}
                    <span className="font-medium">{MOCK_LOANS.length}</span> loans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 