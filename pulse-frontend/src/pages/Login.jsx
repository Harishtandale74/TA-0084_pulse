import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../api/client';
import { LoadingSpinner } from '../components/common';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

function Login() {
  const [error, setError] = useState(null);
  const { login, setLoading, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      const response = await authAPI.login(data);
      const { user, token } = response.data;
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      // Provide more helpful error messages
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Use Quick Demo Access below to continue without backend.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo login for development
  const handleDemoLogin = (role) => {
    const demoUsers = {
      DISPATCHER: { id: 1, name: 'Demo Dispatcher', email: 'dispatcher@pulse.com', role: 'DISPATCHER' },
      DOCTOR: { id: 2, name: 'Dr. Smith', email: 'doctor@pulse.com', role: 'DOCTOR' },
      HOSPITAL_ADMIN: { id: 3, name: 'Hospital Admin', email: 'admin@hospital.com', role: 'HOSPITAL_ADMIN' },
      ADMIN: { id: 4, name: 'System Admin', email: 'admin@pulse.com', role: 'ADMIN' },
    };
    login(demoUsers[role], 'demo-token-' + role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">PULSE</h1>
          <p className="text-gray-400 mt-2">Emergency Healthcare Command Center</p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="input"
                placeholder="email@example.com"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="input"
                placeholder="••••••••"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo Logins */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center mb-4">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoLogin('DISPATCHER')}
                className="btn-ghost text-sm py-2"
              >
                Dispatcher
              </button>
              <button
                onClick={() => handleDemoLogin('DOCTOR')}
                className="btn-ghost text-sm py-2"
              >
                Doctor
              </button>
              <button
                onClick={() => handleDemoLogin('HOSPITAL_ADMIN')}
                className="btn-ghost text-sm py-2"
              >
                Hospital Admin
              </button>
              <button
                onClick={() => handleDemoLogin('ADMIN')}
                className="btn-ghost text-sm py-2"
              >
                System Admin
              </button>
            </div>
          </div>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
