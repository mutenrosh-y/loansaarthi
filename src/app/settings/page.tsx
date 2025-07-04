'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useSession } from 'next-auth/react';
import {
  UserCircleIcon,
  KeyIcon,
  UserGroupIcon,
  BellIcon,
  WrenchScrewdriverIcon,
  BuildingOfficeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

type SettingsTab = 'profile' | 'security' | 'permissions' | 'notifications' | 'system' | 'branch' | 'terms';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
    { id: 'permissions', name: 'Permissions', icon: UserGroupIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'system', name: 'System', icon: WrenchScrewdriverIcon },
  ];
  
  return (
    <AppLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and configurations
          </p>
        </div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 mt-6">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {/* Sidebar */}
              <div className="w-full sm:w-64 bg-gray-50 sm:border-r border-gray-200">
                <nav className="flex flex-col sm:h-full py-4 px-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={`flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <tab.icon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Settings</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                      <div className="flex flex-col sm:flex-row sm:space-x-6">
                        <div className="flex-shrink-0 mb-4 sm:mb-0">
                          <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                            <UserCircleIcon className="h-24 w-24" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <ProfileForm session={session} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Change Password</h3>
                      <PasswordChangeForm />
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account by enabling two-factor authentication.
                            </p>
                          </div>
                          <div className="ml-3">
                            <button className="btn-secondary" disabled>Enable 2FA (Coming Soon)</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'permissions' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">User Permissions</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                      <PermissionsManager />
                    </div>
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                      <NotificationPreferencesForm session={session} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'system' && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">System Settings</h2>
                    <div className="bg-white shadow rounded-lg p-6">
                      <SystemSettingsForm session={session} />
                    </div>
                  </div>
                )}
                
                {(activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'permissions' && activeTab !== 'notifications' && activeTab !== 'system') && (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {tabs.find(tab => tab.id === activeTab)?.name} Settings
                      </h3>
                      <p className="text-gray-500">
                        This section is under development.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ProfileForm({ session }: { session: any }) {
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    branchId: session?.user?.branchId || '',
  })
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchBranches()
  }, [])

  async function fetchBranches() {
    try {
      const res = await fetch('/api/branches')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch branches')
      setBranches(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, branchId: form.branchId })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update profile')
      setSuccess('Profile updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="branchId" className="form-label">Branch</label>
          <select
            id="branchId"
            name="branchId"
            className="form-input"
            value={form.branchId}
            onChange={handleChange}
            required
          >
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

function PasswordChangeForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('All fields are required')
      return
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setSuccess('Password updated successfully')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div>
        <label htmlFor="currentPassword" className="form-label">Current Password</label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          className="form-input"
          value={form.currentPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="form-label">New Password</label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          className="form-input"
          value={form.newPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className="form-input"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  )
}

function PermissionsManager() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const roles = ['ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE']

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users')
      setUsers(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdating(userId)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/users/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update role')
      setSuccess(`Role updated for ${data.name}`)
      setUsers(users => users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUpdating(null)
    }
  }

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return <div className="text-sm text-gray-500">Only admins can manage user permissions.</div>
  }

  if (loading) return <div>Loading users...</div>
  if (error) return <div className="text-red-600 text-sm">{error}</div>

  return (
    <div>
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map(user => (
            <tr key={user.id}>
              <td className="px-4 py-2 whitespace-nowrap">{user.name}</td>
              <td className="px-4 py-2 whitespace-nowrap">{user.email}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={e => handleRoleChange(user.id, e.target.value)}
                  disabled={updating === user.id}
                  className="form-input"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NotificationPreferencesForm({ session }: { session: any }) {
  const [form, setForm] = useState({
    notifyEmail: session?.user?.notifyEmail ?? true,
    notifySMS: session?.user?.notifySMS ?? false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, checked } = e.target
    setForm(f => ({ ...f, [name]: checked }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update preferences')
      setSuccess('Preferences updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div className="flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="notifyEmail"
            checked={form.notifyEmail}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>Email Notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="notifySMS"
            checked={form.notifySMS}
            onChange={handleChange}
            className="form-checkbox"
          />
          <span>SMS Notifications</span>
        </label>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  )
}

function SystemSettingsForm({ session }: { session: any }) {
  const [form, setForm] = useState({
    theme: session?.user?.theme ?? 'system',
    language: session?.user?.language ?? 'en',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update system settings')
      setSuccess('System settings updated successfully')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="theme" className="form-label">Theme</label>
          <select
            id="theme"
            name="theme"
            className="form-input"
            value={form.theme}
            onChange={handleChange}
          >
            <option value="system">System Default</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label htmlFor="language" className="form-label">Language</label>
          <select
            id="language"
            name="language"
            className="form-input"
            value={form.language}
            onChange={handleChange}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
} 