'use client';

import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { redirect } from 'next/navigation';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login', '/auth/register'];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  
  // If not authenticated and not on a public route or home, redirect to login
  if (status === 'unauthenticated' && !isPublicRoute && pathname !== '/') {
    redirect('/auth/login');
  }
  
  // If authenticated and on an auth route, redirect to dashboard
  if (status === 'authenticated' && isPublicRoute) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      <Footer />
    </div>
  );
} 