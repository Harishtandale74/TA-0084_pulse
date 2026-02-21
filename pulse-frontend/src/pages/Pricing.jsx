import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    description: 'For small emergency services getting started',
    features: [
      'Up to 5 active users',
      'Basic dispatch dashboard',
      'Email support',
      'Community access',
      '100 emergencies/month',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$299',
    period: '/month',
    description: 'For growing emergency response teams',
    features: [
      'Up to 50 active users',
      'AI-powered triage',
      'Real-time ambulance tracking',
      'Hospital capacity integration',
      'Priority support',
      'Unlimited emergencies',
      'Custom reporting',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large healthcare networks',
    features: [
      'Unlimited users',
      'Multi-region support',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      '24/7 phone support',
      'On-premise deployment',
      'HIPAA compliance audit',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">PULSE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white text-sm">Sign In</Link>
            <Link to="/register" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          Choose the plan that fits your emergency response needs. All plans include our core features.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'monthly' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === 'annual' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            Annual <span className="text-green-400 text-xs ml-1">Save 20%</span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-red-900/50 to-gray-800 border-2 border-red-500/50 scale-105'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              {plan.highlighted && (
                <div className="text-center mb-4">
                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {billingCycle === 'annual' && plan.price !== 'Free' && plan.price !== 'Custom'
                    ? '$' + Math.round(parseInt(plan.price.replace('$', '')) * 0.8)
                    : plan.price}
                </span>
                <span className="text-gray-400 text-sm ml-2">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                    <svg className="w-5 h-5 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/register')}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-800 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: 'Can I switch plans later?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! Professional plan comes with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, wire transfers for Enterprise plans, and can accommodate purchase orders.',
              },
              {
                q: 'Is my data secure and HIPAA compliant?',
                a: 'Absolutely. PULSE is fully HIPAA compliant with end-to-end encryption and regular security audits.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-900 rounded-xl p-6">
                <h3 className="text-lg font-medium text-white mb-2">{faq.q}</h3>
                <p className="text-gray-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to transform emergency response?</h2>
        <p className="text-gray-400 mb-8">Join hundreds of healthcare providers already using PULSE.</p>
        <Link
          to="/register"
          className="inline-block px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
        >
          Start Your Free Trial
        </Link>
      </section>
    </div>
  );
}

export default Pricing;
