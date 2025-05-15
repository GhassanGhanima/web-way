import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import PricingTable from '../components/marketing/PricingTable';
import FeatureCard from '../components/marketing/FeatureCard';
import Testimonial from '../components/marketing/Testimonial';
import HeroBackground from '../components/marketing/HeroBackground';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Web Accessibility Tool | Make Your Website Accessible to Everyone</title>
        <meta 
          name="description" 
          content="Easy-to-implement accessibility solutions to make your website accessible to everyone. Comply with WCAG, ADA, and Section 508 standards." 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header isScrolled={isScrolled} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <HeroBackground />
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-900">
                  Make Your Website <span className="text-indigo-600">Accessible</span> to Everyone
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-md">
                  Our AI-powered accessibility solution helps your website reach all users, regardless of abilities. Easy to implement, powerful results.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link 
                    href="/signup" 
                    className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-8"
                  >
                    Start Free Trial
                  </Link>
                  <Link 
                    href="/demo" 
                    className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-8"
                  >
                    Watch Demo
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative w-full max-w-lg mx-auto">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                  <div className="relative">
                    <Image 
                      src="/images/accessibility-widget-demo.png" 
                      alt="Accessibility Widget Demo" 
                      width={600} 
                      height={400}
                      className="relative rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-lg font-medium text-gray-600 mb-8">Trusted by leading companies worldwide</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-75">
              {['company1.svg', 'company2.svg', 'company3.svg', 'company4.svg', 'company5.svg'].map((logo, index) => (
                <Image 
                  key={index}
                  src={`/images/logos/${logo}`}
                  alt="Company logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto grayscale"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Features Designed for Everyone</h2>
              <p className="text-xl text-gray-600">
                Our accessibility solution offers a comprehensive suite of features to make your website accessible to all users.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon="/icons/contrast.svg"
                title="High Contrast Mode"
                description="Enable high contrast mode for users with visual impairments to better distinguish content."
              />
              <FeatureCard 
                icon="/icons/text.svg"
                title="Text Size Adjustment"
                description="Allow users to increase or decrease text size for better readability."
              />
              <FeatureCard 
                icon="/icons/reading.svg"
                title="Reading Guide"
                description="Provide a reading guide to help users focus on specific lines of text."
              />
              <FeatureCard 
                icon="/icons/speech.svg"
                title="Text to Speech"
                description="Convert text to spoken audio to assist users with visual impairments or reading difficulties."
              />
              <FeatureCard 
                icon="/icons/keyboard.svg"
                title="Keyboard Navigation"
                description="Enhance keyboard navigation for users who can't use a mouse or prefer keyboard shortcuts."
              />
              <FeatureCard 
                icon="/icons/compliance.svg"
                title="WCAG Compliance"
                description="Meet Web Content Accessibility Guidelines standards with minimal effort."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">
                Implementation is easy and takes less than 5 minutes to set up
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg p-8 shadow-sm relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-6">1</div>
                <h3 className="text-xl font-bold mb-3">Sign Up</h3>
                <p className="text-gray-600">Create an account and select a subscription plan that suits your needs.</p>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-sm relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-6">2</div>
                <h3 className="text-xl font-bold mb-3">Add Script</h3>
                <p className="text-gray-600">Add a single line of JavaScript to your website's code.</p>
              </div>
              <div className="bg-white rounded-lg p-8 shadow-sm relative">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl mb-6">3</div>
                <h3 className="text-xl font-bold mb-3">Customize</h3>
                <p className="text-gray-600">Configure the widget's appearance and enabled features from your dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600">
                Companies of all sizes trust our accessibility solution
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Testimonial 
                quote="We've seen a 40% increase in engagement from users with disabilities after implementing this accessibility widget."
                name="Sarah Johnson"
                title="Director of Digital Accessibility"
                company="Tech Innovators Inc."
                avatar="/images/testimonials/avatar1.jpg"
              />
              <Testimonial 
                quote="Not only did we make our site more accessible, but we also improved our SEO rankings and avoided potential legal issues."
                name="Michael Chen"
                title="CTO"
                company="Global Solutions"
                avatar="/images/testimonials/avatar2.jpg"
              />
              <Testimonial 
                quote="The implementation was incredibly easy, and our customers love the additional accessibility options."
                name="Emily Rodriguez"
                title="Head of Customer Experience"
                company="Retail Enterprises"
                avatar="/images/testimonials/avatar3.jpg"
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600">
                Choose the plan that's right for your business
              </p>
            </div>
            <PricingTable />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-700">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Make Your Website Accessible Today
              </h2>
              <p className="text-xl text-indigo-100 mb-8">
                Join thousands of companies that have already improved their website accessibility.
              </p>
              <Link 
                href="/signup" 
                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Start Your Free Trial
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
