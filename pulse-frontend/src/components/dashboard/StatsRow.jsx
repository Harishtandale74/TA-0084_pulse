import { useEmergencyStore } from '../../stores/emergencyStore';
import { useAmbulanceStore } from '../../stores/ambulanceStore';
import { useHospitalStore } from '../../stores/hospitalStore';
import clsx from 'clsx';

function StatCard({ label, value, icon, color = 'blue', trend = null }) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    red: 'text-red-400 bg-red-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    green: 'text-green-400 bg-green-500/10',
  };

  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div className={clsx('p-2 rounded-lg', colorClasses[color])}>
          {icon}
        </div>
        {trend !== null && (
          <span
            className={clsx(
              'text-xs font-medium',
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
            )}
          >
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="stat-value">{value}</p>
        <p className="stat-label">{label}</p>
      </div>
    </div>
  );
}

function StatsRow() {
  const { activeEmergencies, getEmergenciesByPriority } = useEmergencyStore();
  const { getEnRouteAmbulances } = useAmbulanceStore();
  const { capacitySummary } = useHospitalStore();

  const emergencyCounts = getEmergenciesByPriority();
  const enRouteAmbulances = getEnRouteAmbulances();
  const criticalCount = emergencyCounts.P1 + emergencyCounts.P2;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <StatCard
        label="Active Emergencies"
        value={activeEmergencies.length}
        color="red"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <StatCard
        label="Critical (P1/P2)"
        value={criticalCount}
        color="amber"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        }
      />

      <StatCard
        label="Ambulances En Route"
        value={enRouteAmbulances.length}
        color="blue"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <StatCard
        label="Available Beds"
        value={capacitySummary.availableBeds}
        color="green"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        }
      />

      <StatCard
        label="ICU Available"
        value={capacitySummary.icuAvailable}
        color="amber"
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
      />
    </div>
  );
}

export default StatsRow;
