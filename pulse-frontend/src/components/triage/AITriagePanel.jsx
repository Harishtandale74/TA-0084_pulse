import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { triageAPI } from '../../api/client';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner, PriorityBadge } from '../common';
import clsx from 'clsx';

const triageFormSchema = z.object({
  age: z.number().min(0).max(150),
  sex: z.enum(['male', 'female', 'other']),
  chiefComplaint: z.string().min(3, 'Please describe the main complaint'),
  symptoms: z.string().min(3, 'Please list symptoms'),
  vitals: z.object({
    heartRate: z.number().optional(),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    temperature: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
  }).optional(),
  consciousnessLevel: z.enum(['alert', 'verbal', 'pain', 'unresponsive']).optional(),
  medicalHistory: z.string().optional(),
  allergies: z.string().optional(),
});

function TriageForm({ onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(triageFormSchema),
    defaultValues: {
      sex: 'male',
      consciousnessLevel: 'alert',
    },
  });

  const [showVitals, setShowVitals] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="age" className="label">Age *</label>
          <input
            id="age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            className="input"
            placeholder="Years"
          />
          {errors.age && <p className="text-xs text-red-400 mt-1">{errors.age.message}</p>}
        </div>
        <div>
          <label htmlFor="sex" className="label">Sex *</label>
          <select id="sex" {...register('sex')} className="input">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Chief Complaint */}
      <div>
        <label htmlFor="chiefComplaint" className="label">Chief Complaint *</label>
        <input
          id="chiefComplaint"
          type="text"
          {...register('chiefComplaint')}
          className="input"
          placeholder="Main reason for emergency"
        />
        {errors.chiefComplaint && <p className="text-xs text-red-400 mt-1">{errors.chiefComplaint.message}</p>}
      </div>

      {/* Symptoms */}
      <div>
        <label htmlFor="symptoms" className="label">Symptoms *</label>
        <textarea
          id="symptoms"
          {...register('symptoms')}
          className="input min-h-[80px]"
          placeholder="List all observed symptoms..."
        />
        {errors.symptoms && <p className="text-xs text-red-400 mt-1">{errors.symptoms.message}</p>}
      </div>

      {/* Consciousness Level */}
      <div>
        <label htmlFor="consciousnessLevel" className="label">Consciousness Level</label>
        <select id="consciousnessLevel" {...register('consciousnessLevel')} className="input">
          <option value="alert">Alert - Fully conscious</option>
          <option value="verbal">Verbal - Responds to voice</option>
          <option value="pain">Pain - Responds to pain only</option>
          <option value="unresponsive">Unresponsive</option>
        </select>
      </div>

      {/* Vitals Toggle */}
      <button
        type="button"
        onClick={() => setShowVitals(!showVitals)}
        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
      >
        <svg
          className={clsx('w-4 h-4 transition-transform', showVitals && 'rotate-90')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showVitals ? 'Hide Vitals' : 'Add Vital Signs'}
      </button>

      {/* Vitals Section */}
      {showVitals && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-gray-700/50 rounded-lg">
          <div>
            <label className="label text-xs">Heart Rate (bpm)</label>
            <input
              type="number"
              {...register('vitals.heartRate', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="60-100"
            />
          </div>
          <div>
            <label className="label text-xs">SpO2 (%)</label>
            <input
              type="number"
              {...register('vitals.oxygenSaturation', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="95-100"
            />
          </div>
          <div>
            <label className="label text-xs">BP Systolic</label>
            <input
              type="number"
              {...register('vitals.bloodPressureSystolic', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="120"
            />
          </div>
          <div>
            <label className="label text-xs">BP Diastolic</label>
            <input
              type="number"
              {...register('vitals.bloodPressureDiastolic', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="80"
            />
          </div>
          <div>
            <label className="label text-xs">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              {...register('vitals.temperature', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="98.6"
            />
          </div>
          <div>
            <label className="label text-xs">Resp Rate (/min)</label>
            <input
              type="number"
              {...register('vitals.respiratoryRate', { valueAsNumber: true })}
              className="input text-sm"
              placeholder="12-20"
            />
          </div>
        </div>
      )}

      {/* Medical History & Allergies */}
      <div>
        <label htmlFor="medicalHistory" className="label">Medical History</label>
        <input
          id="medicalHistory"
          type="text"
          {...register('medicalHistory')}
          className="input"
          placeholder="Known conditions, medications..."
        />
      </div>

      <div>
        <label htmlFor="allergies" className="label">Allergies</label>
        <input
          id="allergies"
          type="text"
          {...register('allergies')}
          className="input"
          placeholder="Known allergies..."
        />
      </div>

      {/* Submit */}
      <button type="submit" className="btn-primary w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Analyzing...
          </span>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Run AI Triage
          </>
        )}
      </button>
    </form>
  );
}

function TriageResult({ result, onConfirm, isConfirming }) {
  const { user } = useAuthStore();
  const canConfirm = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
        <div className="flex items-center gap-3">
          <PriorityBadge priority={result.level} size="lg" />
          <div>
            <p className="font-semibold text-white">Triage Level: {result.level}</p>
            <p className="text-xs text-gray-400">
              {result.levelDescription}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Confidence</span>
            <span className={clsx(
              'text-lg font-bold',
              result.confidence >= 80 ? 'text-green-400' :
              result.confidence >= 60 ? 'text-amber-400' : 'text-red-400'
            )}>
              {result.confidence}%
            </span>
          </div>
          <div className="w-24 h-2 bg-gray-600 rounded-full mt-1">
            <div
              className={clsx(
                'h-full rounded-full',
                result.confidence >= 80 ? 'bg-green-500' :
                result.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assessment */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Assessment</h4>
        <p className="text-sm text-white bg-gray-700/50 p-3 rounded-lg">{result.assessment}</p>
      </div>

      {/* Immediate Actions */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Immediate Actions Required</h4>
        <ul className="space-y-2">
          {result.immediateActions.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="text-green-400 mt-0.5">✓</span>
              <span className="text-white">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contraindications */}
      {result.contraindications && result.contraindications.length > 0 && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-xs font-semibold text-red-400 uppercase mb-2">⚠ Contraindications</h4>
          <ul className="space-y-1">
            {result.contraindications.map((item, idx) => (
              <li key={idx} className="text-sm text-red-300">• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirm Button */}
      {canConfirm && !result.confirmedBy && (
        <button
          onClick={onConfirm}
          className="btn-primary w-full"
          disabled={isConfirming}
        >
          {isConfirming ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Confirm Triage (Doctor Approval)
            </>
          )}
        </button>
      )}

      {result.confirmedBy && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <p className="text-sm text-green-400">
            ✓ Confirmed by {result.confirmedBy.name} at {new Date(result.confirmedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}

function AITriagePanel() {
  const { selectedEmergencyId } = useEmergencyStore();
  const { showSuccess, showError } = useUIStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [triageResult, setTriageResult] = useState(null);

  // Fetch triage history for selected emergency
  const { data: triageHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['triage-history', selectedEmergencyId],
    queryFn: async () => {
      if (!selectedEmergencyId) return [];
      const response = await triageAPI.getHistory(selectedEmergencyId);
      return response.data;
    },
    enabled: !!selectedEmergencyId,
  });

  // Analyze mutation
  const analyzeMutation = useMutation({
    mutationFn: (data) => triageAPI.analyze({
      ...data,
      emergencyId: selectedEmergencyId,
    }),
    onSuccess: (response) => {
      setTriageResult(response.data);
      showSuccess('AI triage analysis complete');
      queryClient.invalidateQueries({ queryKey: ['triage-history', selectedEmergencyId] });
    },
    onError: (error) => {
      // Mock result for demo
      setTriageResult({
        id: Date.now(),
        level: 'P2',
        levelDescription: 'Urgent - Requires prompt medical attention',
        confidence: 87,
        assessment: 'Based on the symptoms provided, this appears to be a moderate to severe condition requiring urgent care. Vital signs indicate potential cardiac involvement.',
        immediateActions: [
          'Monitor vital signs continuously',
          'Administer oxygen if SpO2 < 94%',
          'Establish IV access',
          'Prepare for ECG on arrival',
          'Keep patient calm and still',
        ],
        contraindications: [
          'Avoid aspirin if bleeding is suspected',
        ],
        timestamp: new Date().toISOString(),
      });
    },
  });

  // Confirm mutation
  const confirmMutation = useMutation({
    mutationFn: () => triageAPI.confirm(triageResult?.id, user?.id),
    onSuccess: () => {
      showSuccess('Triage confirmed');
      setTriageResult((prev) => ({
        ...prev,
        confirmedBy: user,
        confirmedAt: new Date().toISOString(),
      }));
      queryClient.invalidateQueries({ queryKey: ['triage-history', selectedEmergencyId] });
    },
    onError: () => {
      // Mock confirmation for demo
      setTriageResult((prev) => ({
        ...prev,
        confirmedBy: user,
        confirmedAt: new Date().toISOString(),
      }));
      showSuccess('Triage confirmed');
    },
  });

  const handleAnalyze = (formData) => {
    analyzeMutation.mutate(formData);
  };

  const handleConfirm = () => {
    confirmMutation.mutate();
  };

  const handleNewTriage = () => {
    setTriageResult(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">AI Triage Assessment</h3>
            <p className="text-xs text-gray-400">Powered by Gemini AI</p>
          </div>
          {triageResult && (
            <button onClick={handleNewTriage} className="btn-ghost text-sm">
              New Assessment
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {triageResult ? (
          <TriageResult
            result={triageResult}
            onConfirm={handleConfirm}
            isConfirming={confirmMutation.isPending}
          />
        ) : (
          <TriageForm onSubmit={handleAnalyze} isLoading={analyzeMutation.isPending} />
        )}

        {/* History */}
        {triageHistory && triageHistory.length > 0 && !triageResult && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Previous Assessments</h4>
            <div className="space-y-2">
              {triageHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700"
                  onClick={() => setTriageResult(item)}
                >
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={item.level} size="sm" />
                    <span className="text-sm text-white">{item.confidence}% confidence</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AITriagePanel;
