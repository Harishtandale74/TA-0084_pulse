import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

// Navigation Header
function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Features', sectionId: 'features' },
    { label: 'How It Works', sectionId: 'how-it-works' },
    { label: 'Solutions', sectionId: 'solutions' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">PULSE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              link.sectionId ? (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.sectionId)}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-gray-400 text-sm">
                  Welcome, <span className="text-white">{user?.name || user?.email}</span>
                </span>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                link.sectionId ? (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.sectionId)}
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <div className="border-t border-gray-700 mt-2 pt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { navigate('/dashboard'); setIsMobileMenuOpen(false); }}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center font-medium"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                      className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                      className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                      className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-center font-medium"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function HeroSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">PULSE</h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-gray-400 mb-4 tracking-wide uppercase">
          Emergency Healthcare Command Center
        </p>

        {/* Main headline */}
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Saving Lives Through
          <span className="block bg-gradient-to-r from-red-400 via-red-500 to-amber-500 bg-clip-text text-transparent">
            Intelligent Emergency Response
          </span>
        </h2>

        {/* Description */}
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          PULSE integrates AI-powered triage, real-time ambulance tracking, and hospital capacity management 
          into one unified platform. Every second counts in emergencies — we make them count more.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105"
              >
                Login to Dashboard
              </button>
              <button
                onClick={() => navigate('/login?demo=true')}
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-lg font-semibold rounded-xl transition-all duration-300"
              >
                Request Demo
              </button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: '< 8min', label: 'Avg Response Time' },
            { value: '99.9%', label: 'System Uptime' },
            { value: '50K+', label: 'Emergencies Handled' },
            { value: '200+', label: 'Connected Hospitals' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'AI-Powered Triage',
      description: 'Gemini-powered assessment analyzes symptoms in real-time, providing P1-P4 priority classifications with 95% accuracy. Doctors confirm AI recommendations for optimal care.',
      color: 'red',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: 'Real-Time Tracking',
      description: 'Track every ambulance on a live map with sub-second updates. Automatic ETA calculations and route optimization ensure the fastest response times.',
      color: 'blue',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      title: 'Hospital Capacity',
      description: 'Real-time bed availability across all connected hospitals. ICU, trauma, and general bed counts update automatically as patients are admitted or discharged.',
      color: 'green',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Family Portal',
      description: 'Keep families informed with a dedicated portal showing live ambulance location, ETA, and progress timeline. Optional video calls with medical team.',
      color: 'purple',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Team Communication',
      description: 'Integrated chat system connects dispatchers, paramedics, and hospital staff. File sharing, voice messages, and priority indicators for urgent communications.',
      color: 'amber',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics Dashboard',
      description: 'Comprehensive metrics on response times, case outcomes, and system performance. Identify bottlenecks and optimize your emergency response operations.',
      color: 'cyan',
    },
  ];

  const colorClasses = {
    red: 'bg-red-500/20 text-red-400 group-hover:bg-red-500/30',
    blue: 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30',
    green: 'bg-green-500/20 text-green-400 group-hover:bg-green-500/30',
    purple: 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30',
    amber: 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/30',
  };

  return (
    <section id="features" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-red-400 font-semibold tracking-wide uppercase mb-3">Features</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything You Need for Emergency Response
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A comprehensive suite of tools designed for dispatchers, paramedics, hospitals, and families.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-gray-600 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${colorClasses[feature.color]}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      title: 'Emergency Reported',
      description: 'Call comes in via 911 or direct SOS button. AI immediately begins symptom assessment.',
    },
    {
      step: '02',
      title: 'AI Triage',
      description: 'Gemini analyzes symptoms, medical history, and context to assign priority level (P1-P4).',
    },
    {
      step: '03',
      title: 'Smart Dispatch',
      description: 'Nearest available ambulance is dispatched with optimal route to scene and hospital.',
    },
    {
      step: '04',
      title: 'Real-Time Coordination',
      description: 'Hospital is notified, family portal activated, and all parties track progress live.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-red-400 font-semibold tracking-wide uppercase mb-3">How It Works</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            From Emergency to Care in Minutes
          </h2>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 -translate-y-1/2" />

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <span className="text-white font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 text-center md:text-left">{step.title}</h3>
                  <p className="text-gray-400 text-sm text-center md:text-left">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PrioritySection() {
  const priorities = [
    { level: 'P1', name: 'Critical', description: 'Life-threatening, immediate intervention required', color: 'red', examples: 'Cardiac arrest, severe trauma, stroke' },
    { level: 'P2', name: 'Urgent', description: 'Serious condition, rapid response needed', color: 'amber', examples: 'Chest pain, difficulty breathing, fractures' },
    { level: 'P3', name: 'Delayed', description: 'Stable but requires medical attention', color: 'blue', examples: 'Minor injuries, mild symptoms, stable conditions' },
    { level: 'P4', name: 'Minor', description: 'Non-urgent, can wait for treatment', color: 'gray', examples: 'Minor cuts, cold symptoms, routine transport' },
  ];

  const colorMap = {
    red: 'border-red-500 bg-red-500/10',
    amber: 'border-amber-500 bg-amber-500/10',
    blue: 'border-blue-500 bg-blue-500/10',
    gray: 'border-gray-500 bg-gray-500/10',
  };

  const textColorMap = {
    red: 'text-red-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400',
    gray: 'text-gray-400',
  };

  return (
    <section id="solutions" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-red-400 font-semibold tracking-wide uppercase mb-3">Triage System</p>
          <h2 className="text-4xl font-bold text-white mb-4">
            Color-Coded Priority Levels
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our AI triage system classifies emergencies using internationally recognized priority levels.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorities.map((p, idx) => (
            <div
              key={idx}
              className={`border-2 rounded-2xl p-6 ${colorMap[p.color]}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-3xl font-bold ${textColorMap[p.color]}`}>{p.level}</span>
                <span className={`text-lg font-semibold ${textColorMap[p.color]}`}>{p.name}</span>
              </div>
              <p className="text-gray-300 mb-4">{p.description}</p>
              <p className="text-sm text-gray-500">
                <span className="text-gray-400">Examples:</span> {p.examples}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-br from-red-900/50 via-gray-900 to-gray-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Emergency Response?
        </h2>
        <p className="text-xl text-gray-300 mb-10">
          Join the network of hospitals and emergency services using PULSE to save more lives.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
          >
            Get Started Now
          </button>
          <button
            onClick={() => navigate('/login?demo=true')}
            className="px-8 py-4 bg-transparent border-2 border-gray-600 hover:border-gray-500 text-white text-lg font-semibold rounded-xl transition-colors"
          >
            Schedule Demo
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white">PULSE</span>
          </div>
          
          <nav className="flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a>
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
            <a href="mailto:contact@pulse.health" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </nav>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} PULSE Emergency Response System. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            For emergencies, always call 911.
          </p>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PrioritySection />
      <CTASection />
      <Footer />
    </div>
  );
}

export default LandingPage;
