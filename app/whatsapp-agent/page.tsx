'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WhatsAppAuth } from './components/whatsapp-auth'
import { WhatsAppChat } from './components/whatsapp-chat'

export default function WhatsAppAgentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [sessionName, setSessionName] = useState<string>('')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    // Skip if no session name is set initially
    setIsCheckingAuth(false)
  }

  const handleAuthenticated = (sessionName: string) => {
    setIsAuthenticated(true)
    setSessionName(sessionName)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setIsCheckingAuth(false)
    setSessionName('')
  }

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
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors duration-200"
            >
              WordPress Agent
            </Link>
            <Link
              href="/whatsapp-agent"
              className="text-sm font-medium text-[#25d366] dark:text-[#25d366] transition-colors duration-200"
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

      {/* Hero section - only show when not authenticated or checking */}
      {(!isAuthenticated || isCheckingAuth) && (
        <div className="px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-[3rem] lg:text-[4rem] font-medium tracking-tight leading-tight">
              <span className="text-[#25d366] block">
                WhatsApp Agent
              </span>
              <span className="text-[#262626] dark:text-white block text-[3rem] lg:text-[4rem] font-medium -mt-2">
                AI-Powered Messaging Automation
              </span>
            </h1>
            <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
              Connect your WhatsApp and start sending AI-powered messages
            </p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto h-full">
          {isCheckingAuth ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-zinc-600 dark:text-zinc-400">Checking WhatsApp connection...</p>
              </div>
            </div>
          ) : isAuthenticated ? (
            <WhatsAppChat onLogout={handleLogout} sessionName={sessionName} />
          ) : (
            <div className="space-y-12">
              <WhatsAppAuth onAuthenticated={handleAuthenticated} onLogout={handleLogout} />
              
              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Smart Conversations
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    AI-powered chatbots that understand context and provide intelligent responses to customer inquiries.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a3 3 0 01-3-3V9a3 3 0 013-3h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Bulk Messaging
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Send personalized messages to thousands of contacts with automated campaigns and scheduling.
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Analytics & Insights
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Track message delivery, engagement rates, and customer interactions with detailed analytics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}