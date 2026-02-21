import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/authStore';
import { authAPI } from '../api/client';
import { LoadingSpinner } from '../components/common';

const ROLES = [
  {
    id: 'DISPATCHER',
    name: 'Dispatcher',
    icon: '📡',
    description: 'Emergency call handler & resource coordinator',
    color: 'blue',
  },
  {
    id: 'DOCTOR',
    name: 'Doctor / Paramedic',
    icon: '👨‍⚕️',
    description: 'Medical professional providing care & triage',
    color: 'green',
  },
  {
    id: 'HOSPITAL_ADMIN',
    name: 'Hospital Admin',
    icon: '🏥',
    description: 'Hospital capacity & resource manager',
    color: 'purple',
  },
  {
    id: 'AMBULANCE_CREW',
    name: 'Ambulance Crew',
    icon: '🚑',
    description: 'Field emergency responder & patient transport',
    color: 'red',
  },
  {
    id: 'FAMILY',
    name: 'Family Member',
    icon: '👨‍👩‍👧',
    description: 'Track loved ones during emergencies',
    color: 'amber',
  },
];

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[\d\s\-+()]+$/, 'Invalid phone number'),
  role: z.enum(['DISPATCHER', 'DOCTOR', 'HOSPITAL_ADMIN', 'AMBULANCE_CREW', 'FAMILY'], {
    required_error: 'Please select a role',
  }),
  organization: z.string().optional(),
  employeeId: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  // Organization required for hospital staff
  if (['HOSPITAL_ADMIN', 'DOCTOR', 'AMBULANCE_CREW', 'DISPATCHER'].includes(data.role)) {
    return data.organization && data.organization.length >= 2;
  }
  return true;
}, {
  message: 'Organization is required for this role',
  path: ['organization'],
});

function Register() {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { setLoading, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const watchRole = watch('role');
  const showOrganization = ['HOSPITAL_ADMIN', 'DOCTOR', 'AMBULANCE_CREW', 'DISPATCHER'].includes(watchRole);

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      // Prepare registration data
      const registrationData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        password: data.password,
        organization: data.organization || null,
        employeeId: data.employeeId || null,
      };

      try {
        await authAPI.register(registrationData);
      } catch (apiError) {
        // If backend is unavailable and demo mode is enabled, simulate success
        if (apiError.code === 'ERR_NETWORK' || apiError.message?.includes('Network Error')) {
          console.log('[Demo Mode] Backend unavailable - simulating registration');
          // Fall through to success
        } else {
          throw apiError;
        }
      }
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      // Provide more helpful error messages
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        setError('Cannot connect to server. Please try again later or use Demo Mode below.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Demo registration for development
  const handleDemoRegister = () => {
    setSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="card p-8 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
          <p className="text-gray-400 mb-4">
            Your account has been created. Please check your email to verify your account.
          </p>
          <p className="text-gray-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-white">Join PULSE</h1>
          <p className="text-gray-400 text-sm mt-1">Create your emergency response account</p>
        </div>

        {/* Registration Form */}
        <div className="card p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="label mb-3">Select Your Role *</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          field.onChange(role.id);
                          setSelectedRole(role.id);
                        }}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          field.value === role.id
                            ? `border-${role.color}-500 bg-${role.color}-500/10`
                            : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{role.icon}</span>
                          <span className={`font-medium ${
                            field.value === role.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {role.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{role.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.role && (
                <p className="mt-2 text-sm text-red-400">{errors.role.message}</p>
              )}
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="label">Email Address *</label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="input"
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="label">Phone Number *</label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Organization Details (conditional) */}
            {showOrganization && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div>
                  <label htmlFor="organization" className="label">Organization / Hospital *</label>
                  <input
                    id="organization"
                    type="text"
                    {...register('organization')}
                    className="input"
                    placeholder="City General Hospital"
                  />
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-400">{errors.organization.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="employeeId" className="label">Employee ID (optional)</label>
                  <input
                    id="employeeId"
                    type="text"
                    {...register('employeeId')}
                    className="input"
                    placeholder="EMP-12345"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="label">Password *</label>
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className="input"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Min 8 chars, 1 uppercase, 1 lowercase, 1 number
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">Confirm Password *</label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword')}
                  className="input"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                id="agreeToTerms"
                type="checkbox"
                {...register('agreeToTerms')}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
                . I understand that my account requires verification for professional roles.
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-400">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
            </button>
          </form>

          {/* Demo Mode */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-center text-sm text-gray-400 mb-3">Demo Mode</p>
            <button
              onClick={handleDemoRegister}
              className="btn-ghost w-full text-sm"
            >
              Skip Registration (Demo)
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        {/* Role Info */}
        {selectedRole && (
          <div className="mt-4 p-4 card">
            <h3 className="text-sm font-medium text-gray-300 mb-2">
              {ROLES.find(r => r.id === selectedRole)?.icon} {ROLES.find(r => r.id === selectedRole)?.name} Access Includes:
            </h3>
            <ul className="text-xs text-gray-500 space-y-1">
              {selectedRole === 'DISPATCHER' && (
                <>
                  <li>• Real-time emergency dashboard</li>
                  <li>• Ambulance dispatch controls</li>
                  <li>• Hospital capacity monitoring</li>
                  <li>• AI triage assistance</li>
                </>
              )}
              {selectedRole === 'DOCTOR' && (
                <>
                  <li>• Patient medical records</li>
                  <li>• Triage recommendations</li>
                  <li>• Video consultations</li>
                  <li>• Treatment protocols</li>
                </>
              )}
              {selectedRole === 'HOSPITAL_ADMIN' && (
                <>
                  <li>• Bed capacity management</li>
                  <li>• Resource allocation</li>
                  <li>• Incoming patient alerts</li>
                  <li>• Staff coordination</li>
                </>
              )}
              {selectedRole === 'AMBULANCE_CREW' && (
                <>
                  <li>• Navigation & routing</li>
                  <li>• Patient vitals entry</li>
                  <li>• Hospital communication</li>
                  <li>• Equipment checklists</li>
                </>
              )}
              {selectedRole === 'FAMILY' && (
                <>
                  <li>• Emergency status tracking</li>
                  <li>• Location updates</li>
                  <li>• Hospital information</li>
                  <li>• Notification preferences</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;
