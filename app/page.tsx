'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'

export default function Home() {
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
            Create Beautiful
            <span className="text-green-600 block">Frame Campaigns</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Design stunning photo frames for your events, causes, and celebrations. 
            Share them with the world and let your supporters show their pride.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/create"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Create a Campaign
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Frame</h3>
              <p className="text-gray-600">
                Upload a PNG image with transparency to create your custom frame design.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize Details</h3>
              <p className="text-gray-600">
                Add your campaign name, description, and choose visibility settings.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
              <p className="text-gray-600">
                Get a unique link to share your campaign with friends and supporters.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Engagement</h3>
              <p className="text-gray-600">
                Monitor how many people are using your frame and sharing their photos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your First Campaign?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of creators who are already using Phrames to engage their communities.
          </p>
          {user ? (
            <Link
              href="/create"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Create Your Campaign
            </Link>
          ) : (
            <Link
              href="/signup"
              className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Start Creating Today
            </Link>
          )}
        </div>
      </section>
    </main>
  )
}