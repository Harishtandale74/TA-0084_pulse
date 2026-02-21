import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingSpinner } from '../components/common';

const contactSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Company name is required'),
  role: z.string().min(1, 'Please select your role'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

function Contact() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Contact form submitted:', data);
    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for reaching out. Our team will get back to you within 24 hours.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Contact Info */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Have questions about PULSE? Our team is here to help you transform your emergency response.
            </p>

            {/* Contact Methods */}
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Email Us</h3>
                  <p className="text-gray-400">support@pulse-emergency.com</p>
                  <p className="text-gray-400">sales@pulse-emergency.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Call Us</h3>
                  <p className="text-gray-400">+1 (800) PULSE-911</p>
                  <p className="text-gray-500 text-sm">Monday - Friday, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Visit Us</h3>
                  <p className="text-gray-400">123 Emergency Lane, Suite 500</p>
                  <p className="text-gray-400">New York, NY 10001</p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="p-6 bg-gray-800 rounded-xl">
              <h3 className="text-lg font-medium text-white mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/pricing" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <span>→</span> Pricing
                </Link>
                <Link to="/#features" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <span>→</span> Features
                </Link>
                <Link to="/register" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <span>→</span> Start Free Trial
                </Link>
                <a href="#" className="text-gray-400 hover:text-white text-sm flex items-center gap-2">
                  <span>→</span> Documentation
                </a>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div className="card p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="label">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    {...register('firstName')}
                    className="input"
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="label">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    {...register('lastName')}
                    className="input"
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="label">Email *</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="input"
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="label">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="input"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="label">Company / Organization *</label>
                <input
                  id="company"
                  type="text"
                  {...register('company')}
                  className="input"
                  placeholder="City General Hospital"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-400">{errors.company.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="label">Your Role *</label>
                  <select id="role" {...register('role')} className="input">
                    <option value="">Select role...</option>
                    <option value="executive">Executive / Decision Maker</option>
                    <option value="it">IT / Technical</option>
                    <option value="operations">Operations Manager</option>
                    <option value="medical">Medical Professional</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="label">Subject *</label>
                  <select id="subject" {...register('subject')} className="input">
                    <option value="">Select subject...</option>
                    <option value="demo">Request a Demo</option>
                    <option value="pricing">Pricing Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="label">Message *</label>
                <textarea
                  id="message"
                  {...register('message')}
                  className="input min-h-[120px]"
                  placeholder="Tell us about your emergency response needs..."
                  rows={4}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-400">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? <LoadingSpinner size="sm" /> : 'Send Message'}
              </button>

              <p className="text-center text-gray-500 text-xs">
                By submitting this form, you agree to our Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
