'use client';

import { useState, useEffect } from 'react';
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
  type: string;
  customerName: string;
  size: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  uploadedAt: string;
  expiryDate: string | null;
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED'>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredDocuments = documents.filter(doc => {
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

  const getDocumentTypeIcon = (status: string) => {
    switch(status) {
      case 'VERIFIED':
        return <DocumentCheckIcon className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case 'PENDING':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      case 'REJECTED':
        return <DocumentIcon className="h-5 w-5 text-red-500" aria-hidden="true" />;
      case 'EXPIRED':
        return <DocumentIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error loading documents</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
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
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED')}
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
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
                            {document.status.charAt(0) + document.status.slice(1).toLowerCase()}
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
                            {document.status === 'PENDING' && (
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
                    <span className="font-medium">{documents.length}</span> documents
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