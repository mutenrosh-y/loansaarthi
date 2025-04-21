'use client';

import { useState } from 'react';
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
    { id: 'branch', name: 'Branch', icon: BuildingOfficeIcon },
    { id: 'terms', name: 'Terms & Policies', icon: DocumentTextIcon },
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
                          <button className="mt-2 w-full text-sm font-medium text-blue-600 hover:text-blue-500">
                            Change Avatar
                          </button>
                        </div>
                        <div className="flex-1">
                          <form className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="firstName" className="form-label">First Name</label>
                                <input 
                                  type="text" 
                                  id="firstName" 
                                  className="form-input" 
                                  defaultValue={session?.user?.name?.split(' ')[0] || ''}
                                />
                              </div>
                              <div>
                                <label htmlFor="lastName" className="form-label">Last Name</label>
                                <input 
                                  type="text" 
                                  id="lastName" 
                                  className="form-input" 
                                  defaultValue={session?.user?.name?.split(' ')[1] || ''}
                                />
                              </div>
                            </div>
                            <div>
                              <label htmlFor="email" className="form-label">Email Address</label>
                              <input 
                                type="email" 
                                id="email" 
                                className="form-input" 
                                defaultValue={session?.user?.email || ''}
                              />
                            </div>
                            <div>
                              <label htmlFor="position" className="form-label">Position</label>
                              <input 
                                type="text" 
                                id="position" 
                                className="form-input" 
                                placeholder="e.g. Branch Manager"
                              />
                            </div>
                            <div>
                              <label htmlFor="bio" className="form-label">Bio</label>
                              <textarea 
                                id="bio" 
                                rows={3} 
                                className="form-input" 
                                placeholder="Brief description about yourself"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button type="button" className="btn-secondary mr-3">Cancel</button>
                              <button type="submit" className="btn-primary">Save Changes</button>
                            </div>
                          </form>
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
                      <form className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="form-label">Current Password</label>
                          <input type="password" id="currentPassword" className="form-input" />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="form-label">New Password</label>
                          <input type="password" id="newPassword" className="form-input" />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                          <input type="password" id="confirmPassword" className="form-input" />
                        </div>
                        <div className="flex justify-end">
                          <button type="button" className="btn-secondary mr-3">Cancel</button>
                          <button type="submit" className="btn-primary">Update Password</button>
                        </div>
                      </form>
                      
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">
                              Add an extra layer of security to your account by enabling two-factor authentication.
                            </p>
                          </div>
                          <div className="ml-3">
                            <button className="btn-secondary">Enable 2FA</button>
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
                      <p className="text-sm text-gray-500 mb-4">
                        Configure access controls and permissions for various user roles in the system.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="border rounded-md">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="text-md font-medium text-gray-900">Admin Role</h3>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Administrators have full access to all system features.
                            </p>
                            <button className="text-sm text-blue-600 hover:text-blue-500">Edit permissions</button>
                          </div>
                        </div>
                        
                        <div className="border rounded-md">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="text-md font-medium text-gray-900">Branch Manager Role</h3>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Branch managers have access to branch-specific data and operations.
                            </p>
                            <button className="text-sm text-blue-600 hover:text-blue-500">Edit permissions</button>
                          </div>
                        </div>
                        
                        <div className="border rounded-md">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="text-md font-medium text-gray-900">Loan Officer Role</h3>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Loan officers can manage loan applications and basic customer data.
                            </p>
                            <button className="text-sm text-blue-600 hover:text-blue-500">Edit permissions</button>
                          </div>
                        </div>
                        
                        <div className="border rounded-md">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="text-md font-medium text-gray-900">Customer Service Role</h3>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Customer service representatives can view customer data and handle inquiries.
                            </p>
                            <button className="text-sm text-blue-600 hover:text-blue-500">Edit permissions</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {(activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'permissions') && (
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