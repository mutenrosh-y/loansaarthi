import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChartBarIcon, UserGroupIcon, DocumentTextIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const features = [
    {
      name: 'Loan Management',
      description: 'Efficiently manage and track all your loans in one place',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Customer Database',
      description: 'Maintain comprehensive customer records and history',
      icon: UserGroupIcon,
    },
    {
      name: 'Document Management',
      description: 'Secure storage and easy access to all loan documents',
      icon: DocumentTextIcon,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Get insights with detailed analytics and reporting',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-b from-blue-100/20">
        <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Your Trusted Partner in Financial Growth
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Streamline your loan management process with LoanSaarthi. Manage customers, track loans, and handle documents efficiently.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started
              </Link>
              <Link href="/auth/login" className="text-sm font-semibold leading-6 text-gray-900">
                Sign in <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/apply"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Apply for a Loan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Powerful Features</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to manage loans
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            LoanSaarthi provides all the tools you need to efficiently manage your loan operations and grow your business.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to streamline your loan management?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of financial institutions using LoanSaarthi to manage their operations efficiently.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/auth/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started for free
              </Link>
              <Link href="/auth/login" className="text-sm font-semibold leading-6 text-white">
                Sign in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
