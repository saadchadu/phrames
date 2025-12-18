'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What image format should I upload?',
    answer: 'Upload PNG images with transparency for best results. This allows your frame to overlay perfectly on user photos. Supported aspect ratios: 1:1 (1080×1080px), 4:5 (1080×1350px), or 3:4 (1080×1440px).'
  },
  {
    question: 'What happens when my plan expires?',
    answer: 'When your plan expires, your campaign is archived and becomes invisible to new visitors. However, you can renew it anytime to make it active again. Make sure to download your analytics before expiry.'
  },
  {
    question: 'Can I edit my campaign after publishing?',
    answer: 'Yes! You can update your campaign name, description, and settings anytime from your dashboard. However, the frame image cannot be changed once published.'
  },
  {
    question: 'How do supporters use my frame?',
    answer: 'Share your unique campaign link or QR code. Supporters visit the link, upload their photo, and the frame is automatically applied. They can then download and share their personalized image.'
  },
  {
    question: 'Can I download the analytics data?',
    answer: 'Yes, you can view and export your campaign analytics including views, downloads, supporter locations, and engagement trends from your dashboard.'
  },
  {
    question: 'Is there a limit on frame file size?',
    answer: 'Frame images should be under 10MB for optimal performance. We recommend using PNG format with transparency. Supported aspect ratios: 1:1 (1080×1080px), 4:5 (1080×1350px), or 3:4 (1080×1440px).'
  },
  {
    question: 'Can I create multiple campaigns?',
    answer: 'Absolutely! Create as many campaigns as you need. Each campaign has its own unique link, analytics, and can be managed independently from your dashboard.'
  },
  {
    question: 'Do supporters need to create an account?',
    answer: 'No! Supporters can use your frame without creating an account. They simply visit your campaign link, upload their photo, and download the result instantly.'
  },
  {
    question: 'Can I customize the sharing page?',
    answer: 'Yes, you can customize your campaign name, description, and choose whether to make it public or private. Public campaigns appear in our trending section.'
  },
  {
    question: 'Is the first campaign really free?',
    answer: 'Yes! New users get their first campaign completely free for 1 month. No credit card required to start. After that, choose a plan that fits your needs.'
  }
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-primary/80">
            Everything you need to know about creating and managing campaigns
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-secondary/30 transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg font-semibold text-primary pr-4">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-secondary flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 text-primary/70 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
