'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardStats {
  totalCustomers: number;
  totalLoans: number;
  pendingLoans: number;
  approvedLoans: number;
  totalDocuments: number;
  pendingDocuments: number;
  revenueData: {
    month: string;
    amount: number;
  }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError('')
      try {
        const statsRes = await fetch('/api/dashboard/stats')
        const activityRes = await fetch('/api/dashboard/activity')
        if (!statsRes.ok || !activityRes.ok) throw new Error('Failed to fetch dashboard data')
        setStats(await statsRes.json())
        setActivity(await activityRes.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const statCards = [
    {
      name: 'Total Customers',
      value: stats?.totalCustomers || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/customers'
    },
    {
      name: 'Total Loans',
      value: stats?.totalLoans || 0,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      link: '/loans'
    },
    {
      name: 'Pending Loans',
      value: stats?.pendingLoans || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-yellow-500',
      link: '/loans?status=pending'
    },
    {
      name: 'Approved Loans',
      value: stats?.approvedLoans || 0,
      icon: ArrowTrendingDownIcon,
      color: 'bg-purple-500',
      link: '/loans?status=approved'
    },
    {
      name: 'Total Documents',
      value: stats?.totalDocuments || 0,
      icon: DocumentTextIcon,
      color: 'bg-red-500',
      link: '/documents'
    },
    {
      name: 'Pending Documents',
      value: stats?.pendingDocuments || 0,
      icon: DocumentTextIcon,
      color: 'bg-indigo-500',
      link: '/documents?status=pending'
    },
  ];

  const recentActivities = [
    { id: 1, action: 'New loan application submitted', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Document verified', user: 'Priya Singh', time: '4 hours ago' },
    { id: 3, action: 'Loan approved', user: 'Admin', time: '1 day ago' },
    { id: 4, action: 'New customer registered', user: 'System', time: '2 days ago' },
  ];

  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {session?.user?.name || 'User'}
          </p>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-64 text-red-500">
                {error}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {statCards.map((stat) => (
                    <Link
                      key={stat.name}
                      href={stat.link}
                      className="block hover:shadow-lg transition-shadow"
                    >
                      <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6">
                        <dt>
                          <div className={`absolute rounded-md p-3 ${stat.color}`}>
                            <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                          </div>
                          <p className="ml-16 truncate text-sm font-medium text-gray-500">
                            {stat.name}
                          </p>
                        </dt>
                        <dd className="ml-16 flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">
                            {stat.value}
                          </p>
                        </dd>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Revenue Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Revenue Overview
                      </h2>
                      <select className="text-sm border-gray-300 rounded-md">
                        <option>Last 6 months</option>
                        <option>Last 12 months</option>
                        <option>All time</option>
                      </select>
                    </div>
                    <div className="h-64 flex items-end justify-between">
                      {stats?.revenueData?.map((data: { month: string; amount: number }, index: number) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-12 bg-gradient-to-t from-blue-600 to-blue-300 rounded-t-xl shadow-lg transition-all duration-500"
                            style={{ height: `${(data.amount / 300000) * 180}px` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-2 font-mono tracking-wide">{data.month}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
                      <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="space-y-4">
                      {activity.map((activity: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-lg px-4 py-2 shadow transition hover:scale-[1.01]">
                          <div className="flex-shrink-0 h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse"></div>
                          <div className="flex-1">
                            <span className="font-semibold text-gray-800">{activity.action}</span>
                            <span className="ml-2 text-xs text-gray-500">by {activity.user}</span>
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{new Date(activity.time).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        View all activity →
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 