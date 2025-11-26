'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Download } from 'lucide-react'

const mockExamples = [
  {
    title: 'Birthday Celebration',
    category: 'Personal',
    image: '/examples/birthday.png',
    psdFile: '/examples/psd/birthday.psd',
    color: 'from-pink-500 to-purple-500'
  },
  {
    title: 'Wedding Event',
    category: 'Celebration',
    image: '/examples/wedding.png',
    psdFile: '/examples/psd/wedding.psd',
    color: 'from-rose-500 to-pink-500'
  },
  {
    title: 'Product Launch',
    category: 'Business',
    image: '/examples/product.png',
    psdFile: '/examples/psd/product.psd',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Charity Awareness',
    category: 'Social Cause',
    image: '/examples/charity.png',
    psdFile: '/examples/psd/charity.psd',
    color: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Political Campaign',
    category: 'Politics',
    image: '/examples/political.png',
    psdFile: '/examples/psd/political.psd',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    title: 'Festival Celebration',
    category: 'Holiday',
    image: '/examples/festival.png',
    psdFile: '/examples/psd/festival.psd',
    color: 'from-orange-500 to-yellow-500'
  },
  {
    title: 'Sports Team',
    category: 'Sports',
    image: '/examples/sports.png',
    psdFile: '/examples/psd/sports.psd',
    color: 'from-red-500 to-orange-500'
  },
  {
    title: 'Music Festival',
    category: 'Entertainment',
    image: '/examples/music.png',
    psdFile: '/examples/psd/music.psd',
    color: 'from-purple-500 to-pink-500'
  }
]

export default function ExampleGallery() {
  const { user } = useAuth()

  const handleDownloadPSD = (psdFile: string, title: string) => {
    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = psdFile
    link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-frame.psd`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <section id="examples" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Get Inspired by Examples
          </h2>
          <p className="text-base sm:text-lg text-primary/80 max-w-2xl mx-auto">
            See what's possible with Phrames. Create similar campaigns in minutes
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockExamples.map((example, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-secondary/50 transition-all hover:shadow-xl"
            >
              {/* Gradient placeholder for image */}
              <div className={`aspect-square bg-gradient-to-br ${example.color} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-8 border-white/30 rounded-full"></div>
                </div>
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all"></div>
              </div>
              
              <div className="p-4">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
                  {example.category}
                </span>
                <h3 className="text-lg font-bold text-primary mt-1 mb-3">
                  {example.title}
                </h3>
                <button
                  onClick={() => handleDownloadPSD(example.psdFile, example.title)}
                  className="inline-flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95"
                  title="Download PSD template"
                >
                  <Download className="w-4 h-4" />
                  Download PSD
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={user ? '/create' : '/signup'}
            className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/90 text-primary px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Start Creating Your Own
          </Link>
        </div>
      </div>
    </section>
  )
}
