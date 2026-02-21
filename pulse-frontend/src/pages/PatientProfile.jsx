import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientAPI } from '../api/client';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { LoadingSpinner, Modal, ConfirmDialog } from '../components/common';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import clsx from 'clsx';

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'UNKNOWN']).optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  conditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

function SectionHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueClassName }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-700 last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className={clsx('text-white', valueClassName)}>{value || '—'}</span>
    </div>
  );
}

function EmergencyHistoryCard({ emergency, onClick }) {
  return (
    <button
      onClick={() => onClick(emergency)}
      className="w-full text-left p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={emergency.priority} />
          <StatusBadge status={emergency.status} />
        </div>
        <span className="text-xs text-gray-500">
          {new Date(emergency.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-sm text-white mb-1">{emergency.description}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>Hospital: {emergency.hospital?.name || 'N/A'}</span>
        <span>Ambulance: {emergency.ambulance?.callSign || 'N/A'}</span>
      </div>
    </button>
  );
}

function EditPatientModal({ patient, isOpen, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      dateOfBirth: patient?.dateOfBirth || '',
      gender: patient?.gender || 'OTHER',
      phone: patient?.phone || '',
      email: patient?.email || '',
      address: patient?.address || '',
      bloodType: patient?.bloodType || 'UNKNOWN',
      allergies: patient?.allergies?.join(', ') || '',
      medications: patient?.medications?.join(', ') || '',
      conditions: patient?.conditions?.join(', ') || '',
      emergencyContactName: patient?.emergencyContact?.name || '',
      emergencyContactPhone: patient?.emergencyContact?.phone || '',
      emergencyContactRelation: patient?.emergencyContact?.relation || '',
    },
  });

  const onSubmit = (data) => {
    const formatted = {
      ...data,
      allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      medications: data.medications ? data.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
      conditions: data.conditions ? data.conditions.split(',').map(s => s.trim()).filter(Boolean) : [],
      emergencyContact: data.emergencyContactName ? {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
        relation: data.emergencyContactRelation,
      } : null,
    };
    delete formatted.emergencyContactName;
    delete formatted.emergencyContactPhone;
    delete formatted.emergencyContactRelation;
    onSave(formatted);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Patient" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">PERSONAL INFORMATION</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input
                type="text"
                {...register('firstName')}
                className={clsx('input', errors.firstName && 'border-red-500')}
              />
              {errors.firstName && (
                <p className="text-xs text-red-400 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input
                type="text"
                {...register('lastName')}
                className={clsx('input', errors.lastName && 'border-red-500')}
              />
              {errors.lastName && (
                <p className="text-xs text-red-400 mt-1">{errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className={clsx('input', errors.dateOfBirth && 'border-red-500')}
              />
            </div>
            <div>
              <label className="label">Gender *</label>
              <select {...register('gender')} className="input">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                {...register('email')}
                className="input"
                placeholder="patient@email.com"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input
                type="text"
                {...register('address')}
                className="input"
                placeholder="123 Main St, City, State"
              />
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">MEDICAL INFORMATION</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Blood Type</label>
              <select {...register('bloodType')} className="input">
                <option value="UNKNOWN">Unknown</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="label">Allergies</label>
              <input
                type="text"
                {...register('allergies')}
                className="input"
                placeholder="Penicillin, Peanuts (comma-separated)"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Current Medications</label>
              <input
                type="text"
                {...register('medications')}
                className="input"
                placeholder="Aspirin, Lisinopril (comma-separated)"
              />
            </div>
            <div className="col-span-2">
              <label className="label">Medical Conditions</label>
              <input
                type="text"
                {...register('conditions')}
                className="input"
                placeholder="Diabetes, Hypertension (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">EMERGENCY CONTACT</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Name</label>
              <input
                type="text"
                {...register('emergencyContactName')}
                className="input"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                {...register('emergencyContactPhone')}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="label">Relation</label>
              <input
                type="text"
                {...register('emergencyContactRelation')}
                className="input"
                placeholder="Spouse"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PatientProfile() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showSuccess, showError } = useUIStore();
  const queryClient = useQueryClient();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const canEdit = ['ADMIN', 'DISPATCHER', 'PARAMEDIC'].includes(user?.role);

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      const response = await patientAPI.getById(patientId);
      return response.data;
    },
  });

  // Fetch emergency history
  const { data: emergencyHistory } = useQuery({
    queryKey: ['patient-emergencies', patientId],
    queryFn: async () => {
      const response = await patientAPI.getEmergencies(patientId);
      return response.data;
    },
    enabled: !!patientId,
  });

  // Update patient mutation
  const updateMutation = useMutation({
    mutationFn: (data) => patientAPI.update(patientId, data),
    onSuccess: () => {
      showSuccess('Patient information updated');
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      showError(error.response?.data?.message || 'Failed to update patient');
    },
  });

  // Mock data for demo
  const mockPatient = {
    id: patientId,
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: '1978-05-15',
    gender: 'MALE',
    phone: '(555) 123-4567',
    email: 'john.smith@email.com',
    address: '123 Main Street, Apt 4B, New York, NY 10001',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medications: ['Lisinopril 10mg', 'Metformin 500mg'],
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    emergencyContact: {
      name: 'Jane Smith',
      phone: '(555) 987-6543',
      relation: 'Spouse',
    },
    createdAt: '2021-03-15T10:30:00Z',
    updatedAt: '2024-01-10T14:22:00Z',
  };

  const mockEmergencyHistory = [
    {
      id: '12345',
      priority: 'P1',
      status: 'COMPLETED',
      description: 'Chest pain and shortness of breath',
      createdAt: '2024-01-05T08:30:00Z',
      hospital: { name: 'City General Hospital' },
      ambulance: { callSign: 'Medic 7' },
    },
    {
      id: '12100',
      priority: 'P2',
      status: 'COMPLETED',
      description: 'Fall with head injury',
      createdAt: '2023-08-20T15:45:00Z',
      hospital: { name: 'Memorial Medical Center' },
      ambulance: { callSign: 'Medic 12' },
    },
    {
      id: '11500',
      priority: 'P3',
      status: 'COMPLETED',
      description: 'Allergic reaction - mild',
      createdAt: '2023-02-10T11:20:00Z',
      hospital: { name: 'St. Mary\'s Hospital' },
      ambulance: { callSign: 'Medic 3' },
    },
  ];

  const displayPatient = patient || mockPatient;
  const displayHistory = emergencyHistory || mockEmergencyHistory;

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 className="text-lg font-semibold text-white mb-2">Patient Not Found</h2>
          <p className="text-gray-400 mb-4">The patient record could not be found.</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {displayPatient.firstName?.charAt(0)}{displayPatient.lastName?.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {displayPatient.firstName} {displayPatient.lastName}
            </h1>
            <p className="text-gray-400">
              {calculateAge(displayPatient.dateOfBirth)} years old • {displayPatient.gender}
            </p>
          </div>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Patient
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Personal & Contact */}
        <div className="space-y-6">
          {/* Personal Details */}
          <section className="card">
            <SectionHeader title="Personal Details" />
            <div className="space-y-1">
              <InfoRow label="Date of Birth" value={new Date(displayPatient.dateOfBirth).toLocaleDateString()} />
              <InfoRow label="Gender" value={displayPatient.gender} />
              <InfoRow label="Blood Type" value={displayPatient.bloodType} valueClassName="font-semibold text-red-400" />
              <InfoRow label="Phone" value={displayPatient.phone} />
              <InfoRow label="Email" value={displayPatient.email} />
              <InfoRow label="Address" value={displayPatient.address} />
            </div>
          </section>

          {/* Emergency Contact */}
          <section className="card">
            <SectionHeader title="Emergency Contact" />
            {displayPatient.emergencyContact ? (
              <div className="space-y-1">
                <InfoRow label="Name" value={displayPatient.emergencyContact.name} />
                <InfoRow label="Phone" value={displayPatient.emergencyContact.phone} />
                <InfoRow label="Relation" value={displayPatient.emergencyContact.relation} />
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No emergency contact on file</p>
            )}
          </section>
        </div>

        {/* Middle Column - Medical Info */}
        <div className="space-y-6">
          {/* Allergies */}
          <section className="card">
            <SectionHeader title="Allergies">
              {displayPatient.allergies?.length > 0 && (
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                  {displayPatient.allergies.length} listed
                </span>
              )}
            </SectionHeader>
            {displayPatient.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {displayPatient.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No known allergies</p>
            )}
          </section>

          {/* Current Medications */}
          <section className="card">
            <SectionHeader title="Current Medications">
              {displayPatient.medications?.length > 0 && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  {displayPatient.medications.length} active
                </span>
              )}
            </SectionHeader>
            {displayPatient.medications?.length > 0 ? (
              <ul className="space-y-2">
                {displayPatient.medications.map((med, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    {med}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No current medications</p>
            )}
          </section>

          {/* Medical Conditions */}
          <section className="card">
            <SectionHeader title="Medical Conditions">
              {displayPatient.conditions?.length > 0 && (
                <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                  {displayPatient.conditions.length} conditions
                </span>
              )}
            </SectionHeader>
            {displayPatient.conditions?.length > 0 ? (
              <ul className="space-y-2">
                {displayPatient.conditions.map((condition, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="w-2 h-2 bg-amber-500 rounded-full" />
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No medical conditions on file</p>
            )}
          </section>
        </div>

        {/* Right Column - Emergency History */}
        <div>
          <section className="card h-full">
            <SectionHeader title="Emergency History">
              <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                {displayHistory.length} records
              </span>
            </SectionHeader>
            {displayHistory.length > 0 ? (
              <div className="space-y-3">
                {displayHistory.map((emergency) => (
                  <EmergencyHistoryCard
                    key={emergency.id}
                    emergency={emergency}
                    onClick={setSelectedEmergency}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500">No emergency history</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Record Info Footer */}
      <div className="text-center text-xs text-gray-600 pt-4 border-t border-gray-800">
        <p>
          Record created: {new Date(displayPatient.createdAt).toLocaleDateString()} • 
          Last updated: {new Date(displayPatient.updatedAt).toLocaleDateString()}
        </p>
        <p className="mt-1">Patient ID: {displayPatient.id}</p>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditPatientModal
          patient={displayPatient}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(data) => updateMutation.mutate(data)}
        />
      )}

      {/* Emergency Detail Modal */}
      <Modal
        isOpen={!!selectedEmergency}
        onClose={() => setSelectedEmergency(null)}
        title={`Emergency #${selectedEmergency?.id}`}
      >
        {selectedEmergency && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PriorityBadge priority={selectedEmergency.priority} />
              <StatusBadge status={selectedEmergency.status} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Description</p>
              <p className="text-white">{selectedEmergency.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white">
                  {new Date(selectedEmergency.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Hospital</p>
                <p className="text-white">{selectedEmergency.hospital?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Ambulance</p>
                <p className="text-white">{selectedEmergency.ambulance?.callSign || 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-700">
              <button
                onClick={() => navigate(`/?emergency=${selectedEmergency.id}`)}
                className="btn-primary"
              >
                View Full Details
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PatientProfile;
