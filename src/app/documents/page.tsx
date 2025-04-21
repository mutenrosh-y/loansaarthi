'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  DocumentIcon,
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Document {
  id: string;
  name: string;
  type: 'identity' | 'address' | 'income' | 'bank' | 'property' | 'other';
  customerName: string;
  size: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  expiryDate: string | null;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'DOC001',
    name: 'Aadhar Card.pdf',
    type: 'identity',
    customerName: 'John Doe',
    size: '2.4 MB',
    status: 'verified',
    uploadedAt: '2023-01-15',
    expiryDate: null,
  },
  {
    id: 'DOC002',
    name: 'Electricity Bill.pdf',
    type: 'address',
    customerName: 'Jane Smith',
    size: '1.2 MB',
    status: 'verified',
    uploadedAt: '2023-02-10',
    expiryDate: '2023-05-10',
  },
  {
    id: 'DOC003',
    name: 'Salary Slip.pdf',
    type: 'income',
    customerName: 'Amit Patel',
    size: '3.1 MB',
    status: 'pending',
    uploadedAt: '2023-03-05',
    expiryDate: null,
  },
  {
    id: 'DOC004',
    name: 'Bank Statement.pdf',
    type: 'bank',
    customerName: 'Priya Singh',
    size: '4.7 MB',
    status: 'rejected',
    uploadedAt: '2023-02-28',
    expiryDate: null,
  },
  {
    id: 'DOC005',
    name: 'Property Deed.pdf',
    type: 'property',
    customerName: 'Rajesh Kumar',
    size: '5.2 MB',
    status: 'pending',
    uploadedAt: '2023-01-20',
    expiryDate: null,
  },
];

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => {
    const matchesSearch = 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getDocumentTypeLabel = (type: string) => {
    switch(type) {
      case 'identity':
        return 'Identity Proof';
      case 'address':
        return 'Address Proof';
      case 'income':
        return 'Income Proof';
      case 'bank':
        return 'Bank Statement';
      case 'property':
        return 'Property Document';
      case 'other':
        return 'Other Document';
      default:
        return type;
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch(type) {
      case 'verified':
        return <DocumentCheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case 'pending':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      case 'rejected':
        return <DocumentIcon className="h-5 w-5 text-red-500" aria-hidden="true" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
            <Link href="/documents/upload" className="btn-primary inline-flex items-center">
              <PlusIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload Document
            </Link>
          </div>
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative col-span-1 sm:col-span-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <select
                  className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Document Types</option>
                  <option value="identity">Identity Proof</option>
                  <option value="address">Address Proof</option>
                  <option value="income">Income Proof</option>
                  <option value="bank">Bank Statement</option>
                  <option value="property">Property Document</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <select
                  className="block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DocumentIcon className="h-5 w-5 text-gray-500 mr-2" aria-hidden="true" />
                            <div className="font-medium text-gray-900">{document.name}</div>
                          </div>
                          <div className="text-xs text-gray-500">{document.size}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {getDocumentTypeLabel(document.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                          {document.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(document.status)}`}>
                            {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {document.uploadedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {document.expiryDate || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {document.status === 'pending' && (
                              <button className="text-red-600 hover:text-red-900">
                                <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                        No documents found. Try adjusting your search or filters.
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
                    Showing <span className="font-medium">{filteredDocuments.length}</span> of{' '}
                    <span className="font-medium">{MOCK_DOCUMENTS.length}</span> documents
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