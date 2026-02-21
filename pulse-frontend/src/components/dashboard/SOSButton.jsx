import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { emergencyAPI } from '../../api/client';
import { useUIStore } from '../../stores/uiStore';
import { Modal, ConfirmDialog, LoadingSpinner } from '../common';

const sosSchema = z.object({
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  description: z.string().min(5, 'Please provide a brief description'),
  priority: z.enum(['P1', 'P2', 'P3', 'P4']),
  patientInfo: z.object({
    name: z.string().optional(),
    age: z.number().optional(),
    symptoms: z.string().optional(),
  }).optional(),
});

function SOSButton() {
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState(null);
  const { showSuccess, showError } = useUIStore();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      priority: 'P1',
      location: { lat: 0, lng: 0 },
    },
  });

  const sosMutation = useMutation({
    mutationFn: (data) => emergencyAPI.triggerSOS(data),
    onSuccess: () => {
      showSuccess('SOS emergency created successfully');
      queryClient.invalidateQueries({ queryKey: ['emergencies'] });
      setShowConfirm(false);
      setShowForm(false);
      reset();
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to create emergency');
    },
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          showError('Could not get your location');
        }
      );
    }
  };

  const onSubmit = (data) => {
    setFormData(data);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (formData) {
      sosMutation.mutate(formData);
    }
  };

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={() => setShowForm(true)}
        className="group relative flex items-center justify-center w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full shadow-lg shadow-red-600/30 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-500/50"
        aria-label="Trigger SOS Emergency"
      >
        <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-30" />
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {/* SOS Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          reset();
        }}
        title="Trigger SOS Emergency"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Priority Selection */}
          <div>
            <label className="label">Emergency Priority</label>
            <div className="grid grid-cols-4 gap-2">
              {['P1', 'P2', 'P3', 'P4'].map((p) => (
                <label
                  key={p}
                  className="flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all"
                  style={{
                    borderColor: p === 'P1' ? '#ef4444' : p === 'P2' ? '#f59e0b' : p === 'P3' ? '#3b82f6' : '#6b7280',
                    backgroundColor: p === 'P1' ? 'rgba(239, 68, 68, 0.1)' : p === 'P2' ? 'rgba(245, 158, 11, 0.1)' : p === 'P3' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  }}
                >
                  <input
                    type="radio"
                    {...register('priority')}
                    value={p}
                    className="sr-only"
                  />
                  <span className="font-bold">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="label">Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Latitude"
                {...register('location.lat', { valueAsNumber: true })}
                className="input flex-1"
              />
              <input
                type="text"
                placeholder="Longitude"
                {...register('location.lng', { valueAsNumber: true })}
                className="input flex-1"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                className="btn-secondary"
                aria-label="Get current location"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">
              Description *
            </label>
            <textarea
              id="description"
              {...register('description')}
              className="input min-h-[80px]"
              placeholder="Brief description of the emergency..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Patient Info (Optional) */}
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Patient Information (Optional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Patient Name"
                {...register('patientInfo.name')}
                className="input"
              />
              <input
                type="number"
                placeholder="Age"
                {...register('patientInfo.age', { valueAsNumber: true })}
                className="input"
              />
            </div>
            <textarea
              placeholder="Symptoms/Condition"
              {...register('patientInfo.symptoms')}
              className="input mt-3 min-h-[60px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn-danger flex-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Trigger SOS
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Confirm SOS Emergency"
        message={`You are about to create a ${formData?.priority} emergency. This will alert dispatchers and may dispatch ambulances immediately.`}
        confirmText="Confirm SOS"
        cancelText="Go Back"
        variant="danger"
        isLoading={sosMutation.isPending}
      />
    </>
  );
}

export default SOSButton;
