'use client';

import Image from 'next/image';
import ImageCarousel from './ImageCarousel';
import { useAuth0 } from '@auth0/auth0-react';

export default function LandingPage() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'login',
      }
    });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  };

  // If already authenticated, this component won't be shown
  // but add this check for safety
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <style>{`
        /* Beautiful animations from dashboard */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeInUp 800ms ease both;
        }

        @keyframes hoverPop {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .btn-hover-pop:hover {
          animation: hoverPop 500ms ease;
        }

        /* Glass card effect */
        .glass-card {
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .dark .glass-card {
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* Floating animation for decorative elements */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .float {
          animation: float 6s ease-in-out infinite;
        }

        /* Gradient text effect */
        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Accent script for hero */
        .accent-script {
          font-family: ui-serif, Georgia, 'Times New Roman', serif;
          font-style: italic;
          font-weight: 700;
          letter-spacing: -0.5px;
          transform: translateY(-6px);
          display: inline-block;
        }

        /* Outer centered frame to emulate the rounded panel */
        .outer-frame {
          border-radius: 18px;
          border: 6px solid rgba(219,234,254,0.8); /* pale blue frame */
        }

  /* Gallery styles: large rounded cards with soft white border and shadow to match sample */
  .gallery-wrapper::-webkit-scrollbar { height: 10px; }
  .gallery-wrapper::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 999px; }
  .gallery-card { transition: transform 300ms ease, box-shadow 300ms ease; border-radius: 28px; overflow: hidden; box-shadow: 0 18px 40px rgba(2,6,23,0.12); border: 8px solid rgba(255,250,245,0.95); background-clip: padding-box; }
  .gallery-card:hover { transform: translateY(-10px) scale(1.03); box-shadow: 0 30px 60px rgba(2,6,23,0.16); }
  .gallery-card img, .gallery-card :global(img) { object-fit: cover; object-position: center; }

        /* Staggered animation delays */
        .fade-in:nth-child(1) { animation-delay: 0.1s; }
        .fade-in:nth-child(2) { animation-delay: 0.2s; }
        .fade-in:nth-child(3) { animation-delay: 0.3s; }
        .fade-in:nth-child(4) { animation-delay: 0.4s; }
        .fade-in:nth-child(5) { animation-delay: 0.5s; }
      `}</style>

  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl float" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Header - Sleek and Modern */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">🌍</span>
                </div>
                <span className="font-bold text-2xl text-gray-900 dark:text-white">VACAI</span>
              </div>
              <button
                onClick={handleLogin}
                className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg backdrop-blur-sm border border-white/20 dark:border-gray-700/50 btn-hover-pop font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section - Beautiful and Engaging */}
        <main className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
            <div className="text-center fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-8 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Powered by Azure & AI
              </div>

              {/* Hero styled to match sample: large headline with accent script and black CTA */}
              <div className="outer-frame mx-auto rounded-2xl p-10 bg-white/80 dark:bg-gray-900/70 shadow-2xl" style={{maxWidth: '1100px'}}>
                <div className="py-6">
                  <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
                    Make Your <span className="accent-script text-4xl md:text-7xl text-orange-500">Summer Vacation</span>
                    <span className="block">Unforgettable!</span>
                  </h1>

                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                    Get your dream trip planned with expert-guided destinations, booking, transport & more — all in one place.
                  </p>

                  <div className="flex justify-center items-center gap-4">
                    <button
                      onClick={handleSignUp}
                      className="px-8 py-3 bg-black text-white rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 btn-hover-pop"
                    >
                      Start Planning
                    </button>
                    <button
                      onClick={handleLogin}
                      className="px-6 py-3 glass-card text-gray-900 dark:text-white rounded-full hover:bg-white/90 transition-all duration-300 shadow-lg btn-hover-pop"
                    >
                      Explore
                    </button>
                  </div>
                </div>

                {/* Subtle sponsor logos row (faded) */}
                <div className="mt-8 opacity-30 flex items-center justify-between px-6">
                  <Image src="/vercel.svg" width={72} height={18} alt="vercel" />
                  <Image src="/next.svg" width={72} height={18} alt="next" />
                  <Image src="/file.svg" width={72} height={18} alt="badge" />
                </div>
              </div>

              {/* Polished image carousel for hero */}
              <div className="mt-12">
                <div className="mx-auto max-w-5xl">
                  <ImageCarousel
                    images={[
                      '/pexels-asadphoto-457882.jpg',
                      '/pexels-freestockpro-1004584.jpg',
                      '/pexels-pixabay-208701.jpg',
                      '/pexels-recalmedia-60217.jpg',
                      '/pexels-pixabay-38238.jpg',
                      '/pexels-thorsten-technoman-109353-338504.jpg',
                    ]}
                    autoPlay
                    autoPlayInterval={3500}
                    className="w-full h-72 rounded-3xl overflow-hidden shadow-2xl"
                    showIndicators
                    showNavigation
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Features Section - Beautiful Cards */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center mb-16 fade-in">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose VACAI?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Built with cutting-edge AI and cloud technologies for the perfect travel experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 fade-in btn-hover-pop group">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  AI-Powered Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our advanced AI analyzes your preferences to create personalized itineraries tailored just for you.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 fade-in btn-hover-pop group">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Secure & Reliable
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Enterprise-grade security with Azure&apos;s robust infrastructure and compliance standards.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 fade-in btn-hover-pop group">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Modern Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Beautiful, responsive design with smooth animations and intuitive user experience.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section - Compelling Call to Action */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center fade-in">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Ready to Start Your Adventure?
                </h2>
                <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
                  Join thousands of travelers who have discovered their perfect getaway with VACAI.
                </p>
                <button
                  onClick={handleSignUp}
                  className="px-10 py-5 bg-white text-gray-900 text-xl font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-2xl btn-hover-pop transform hover:scale-105"
                >
                  Create Your Account
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - Clean and Minimal */}
        <footer className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-white/20 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-sm">🌍</span>
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">VACAI</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                © 2025 VACAI Travel. Powered by Azure, AI, and modern cloud technologies.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}