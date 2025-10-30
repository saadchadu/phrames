import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center">
          <div className="w-6 h-6 bg-[#00dd78] rounded mr-2"></div>
          <span className="text-xl font-bold text-[#002400]">phrames</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#about" className="text-[#002400] font-medium hover:text-[#00dd78]">About</a>
          <a href="#features" className="text-[#002400] font-medium hover:text-[#00dd78]">Features</a>
          <a href="#pricing" className="text-[#002400] font-medium hover:text-[#00dd78]">Pricing</a>
        </div>
        <div className="flex items-center space-x-3">
          <Link href="/signup">
            <Button 
              variant="secondary" 
              size="sm" 
              className="bg-[#002400] text-white hover:bg-[#002400]/90 border-[#002400]"
            >
              Sign Up
            </Button>
          </Link>
          <Link href="/login">
            <Button 
              size="sm" 
              className="bg-[#00dd78] text-[#002400] hover:bg-[#00dd78]/90 border-[#00dd78]"
            >
              Log In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex items-center justify-between px-8 py-16 max-w-7xl mx-auto">
        <div className="flex-1 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-[#002400] leading-tight mb-6">
            Create Beautiful Photo Frames And Share to the Globe
          </h1>
          <p className="text-lg text-[#002400] mb-6 leading-relaxed">
            Phrames is a free, easy-to-use platform for creating custom photo frame campaigns. Upload your PNG frames and let visitors create personalized images instantly.
          </p>
          <p className="text-sm text-gray-600 mb-8">
            No design skills needed — just creativity.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/campaigns/new">
              <Button 
                size="lg" 
                className="bg-[#002400] text-white hover:bg-[#002400]/90"
              >
                Create a Campaign
              </Button>
            </Link>
            <Link href="/c/demo">
              <Button 
                size="lg" 
                variant="secondary"
                className="border-[#00dd78] text-[#00dd78] hover:bg-[#00dd78]/10"
              >
                Try a Demo Frame
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Hero Image */}
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <div className="w-80 h-96 bg-[#00dd78] rounded-bl-[80px] relative">
              <div 
                className="absolute top-8 left-0 w-80 h-96 rounded-2xl bg-cover bg-center"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=450&fit=crop&crop=face")'
                }}
              ></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#002400] rounded-bl-[40px]"></div>
              <div className="absolute bottom-8 left-8 text-white text-4xl font-bold">
                #phrames
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section id="features" className="bg-[#00dd78]/10 py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#002400] mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600">
              Turn your cause into a shared visual moment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#002400] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00dd78] text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002400] mb-3">Sign Up</h3>
              <p className="text-[#002400] text-sm">
                Create your free creator account and start building your first campaign.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#002400] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00dd78] text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002400] mb-3">Upload Frame</h3>
              <p className="text-[#002400] text-sm">
                Add your PNG with transparent areas. Our system validates the transparency automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#002400] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00dd78] text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002400] mb-3">Share Link</h3>
              <p className="text-[#002400] text-sm">
                Invite your audience with a simple shareable link. No signup required for visitors.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#002400] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00dd78] text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold text-[#002400] mb-3">Community Joins In</h3>
              <p className="text-[#002400] text-sm">
                Supporters add your frame and share their personalized images across social media.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#002400] mb-4">
              Featured Campaigns
            </h2>
            <p className="text-lg text-gray-600">
              See what others are creating with Phrames
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Sample campaigns */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 rounded-t-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop" 
                  alt="Save the Ocean"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#002400] mb-2">Save the Ocean</h3>
                <p className="text-gray-600 text-sm mb-4">Join our movement to protect marine life</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">1.2k downloads</span>
                  <Link href="/c/save-the-ocean" className="text-[#00dd78] hover:text-[#00dd78]/80 font-medium text-sm">
                    Try Frame →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="bg-[#002400] py-20 relative overflow-hidden"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[#002400]/80"></div>
        <div className="relative max-w-6xl mx-auto px-8 flex items-center">
          <div className="flex-1 max-w-2xl">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Turn your cause into a shared visual moment.
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Create shareable photo frames that help your message spread across social media.
            </p>
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-[#00dd78] text-[#002400] hover:bg-[#00dd78]/90"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-[#00dd78] rounded mr-2"></div>
                <span className="text-xl font-bold text-[#002400]">phrames</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Create beautiful photo frames and share them with the world. Free, easy-to-use, and no watermarks.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#002400] mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-600 hover:text-[#00dd78]">Features</a></li>
                <li><a href="#pricing" className="text-gray-600 hover:text-[#00dd78]">Pricing</a></li>
                <li><a href="/campaigns" className="text-gray-600 hover:text-[#00dd78]">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#002400] mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/help" className="text-gray-600 hover:text-[#00dd78]">Help Center</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-[#00dd78]">Contact</a></li>
                <li><a href="/privacy" className="text-gray-600 hover:text-[#00dd78]">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2024 Phrames. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">copyright reserved to cleffon</p>
          </div>
        </div>
      </footer>
    </div>
  )
}