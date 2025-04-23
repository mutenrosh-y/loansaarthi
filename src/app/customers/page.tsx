'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  kycStatus: boolean;
  branch: {
    id: string;
    name: string;
  };
  assignedUser: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branches, setBranches] = useState<{ id: string; name: string; }[]>([]);
  
  useEffect(() => {
    fetchCustomers();
    fetchBranches();
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

  const fetchBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      const data = await response.json();
      setBranches(data);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete customer');
      }

      setCustomers(customers.filter(customer => customer.id !== id));
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && customer.kycStatus) ||
                         (statusFilter === 'inactive' && !customer.kycStatus);
    
    const matchesBranch = !selectedBranch || customer.branch.id === selectedBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

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
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
            <Link href="/customers/add" className="btn-primary inline-flex items-center">
              <PlusIcon className="mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Customer
            </Link>
          </div>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          
          <div className="mt-6 bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  placeholder="Search customers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{customer.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-900">{customer.email}</div>
                          <div className="text-gray-500">{customer.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {`${customer.address}, ${customer.city}, ${customer.state}, ${customer.country}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.kycStatus ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {customer.kycStatus ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {customer.branch.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/customers/${customer.id}`} className="text-blue-600 hover:text-blue-900">
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                            </Link>
                            <Link href={`/customers/${customer.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(customer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No customers found. Try adjusting your search or filters.
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
                    Showing <span className="font-medium">{filteredCustomers.length}</span> of{' '}
                    <span className="font-medium">{customers.length}</span> customers
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