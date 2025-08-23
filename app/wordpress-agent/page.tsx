'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function WordPressAgentPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo and navigation */}
      <header className="px-4 sm:px-6 lg:px-8 py-1 mt-2">
        <div className="max-w-[1216px] mx-auto flex items-center justify-between">
          <Link
            href="https://firecrawl.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Image 
              src="/livvuxplexity-wordmark.svg" 
              alt="livvuxPlexity Logo" 
              width={120} 
              height={24}
              className="h-6 w-auto"
            />
          </Link>
          
          {/* Navigation Menu */}
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              href="/wordpress-agent"
              className="text-sm font-medium text-[#ff4d00] dark:text-[#ff4d00] transition-colors duration-200"
            >
              WordPress Agent
            </Link>
            <Link
              href="/whatsapp-agent"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              WhatsApp Agent
            </Link>
            <Link
              href="/lovable"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              Lovable
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-[3rem] lg:text-[4rem] font-medium tracking-tight leading-tight">
            <span className="text-[#ff4d00] block">
              WordPress Agent
            </span>
            <span className="text-[#262626] dark:text-white block text-[3rem] lg:text-[4rem] font-medium -mt-2">
              AI-Powered Site Management
            </span>
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Automate content creation, SEO optimization, and site management for your WordPress sites
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature Cards */}
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Content Pipeline
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Research, generate, and publish SEO-optimized content automatically to your WordPress sites.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                SEO Automation
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Analyze competitors, identify keyword gaps, and optimize your content for search engines.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                Site Management
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                Monitor site health, manage multiple WordPress installations, and automate maintenance tasks.
              </p>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-lg p-8 border border-orange-200 dark:border-orange-800">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-4">
                Coming Soon
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
                The WordPress Agent is currently in development. It will combine the power of AI with WordPress automation 
                to revolutionize how you manage your sites and create content.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                  WordPress REST API
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                  Browser Automation
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                  AI Content Generation
                </span>
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-sm font-medium">
                  Multi-site Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}