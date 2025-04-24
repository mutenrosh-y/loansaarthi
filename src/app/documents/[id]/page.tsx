'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { 
  DocumentIcon,
  DocumentCheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  expiryDate: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  loan: {
    id: string;
    status: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'VERIFY' | 'REJECT' | null>(null);

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await response.json();
      setDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (action: 'VERIFY' | 'REJECT') => {
    try {
      setIsVerifying(true);
      const response = await fetch(`/api/documents/${params.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comments: verificationComments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify document');
      }

      const updatedDocument = await response.json();
      setDocument(updatedDocument);
      setShowVerificationModal(false);
      setVerificationComments('');
      setVerificationAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !document) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-600 mb-4">{error || 'Document not found'}</p>
          <button
            onClick={() => router.back()}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeftIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </AppLayout>
    );
  }

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
            {document.status === 'PENDING' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setVerificationAction('VERIFY');
                    setShowVerificationModal(true);
                  }}
                  className="btn-primary inline-flex items-center"
                >
                  <DocumentCheckIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
                  Verify Document
                </button>
                <button
                  onClick={() => {
                    setVerificationAction('REJECT');
                    setShowVerificationModal(true);
                  }}
                  className="btn-danger inline-flex items-center"
                >
                  <XMarkIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
                  Reject Document
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DocumentIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {document.name}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Document ID: {document.id}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeClass(document.status)}`}>
                  {document.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Document Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.type}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Customer</dt>
                  <dd className="mt-1 text-sm text-gray-900">{document.customer.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
                  </dd>
                </div>
                {document.loan && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Associated Loan</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Loan ID: {document.loan.id} (Status: {document.loan.status})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-500">Document Preview</h4>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary inline-flex items-center text-sm"
                >
                  <EyeIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
                  View Document
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {verificationAction === 'VERIFY' ? 'Verify Document' : 'Reject Document'}
            </h3>
            <div className="mb-4">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <textarea
                id="comments"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={verificationComments}
                onChange={(e) => setVerificationComments(e.target.value)}
                placeholder="Enter your comments here..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowVerificationModal(false);
                  setVerificationComments('');
                  setVerificationAction(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`${
                  verificationAction === 'VERIFY' ? 'btn-primary' : 'btn-danger'
                }`}
                onClick={() => handleVerification(verificationAction!)}
                disabled={isVerifying}
              >
                {isVerifying ? 'Processing...' : verificationAction === 'VERIFY' ? 'Verify' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
} 