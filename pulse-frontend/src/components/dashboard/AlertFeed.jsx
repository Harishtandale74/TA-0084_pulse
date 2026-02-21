import { useQuery } from '@tanstack/react-query';
import { alertAPI } from '../../api/client';
import { PriorityBadge } from '../common';
import { LoadingSpinner } from '../common';
import clsx from 'clsx';

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

function AlertItem({ alert, onRead }) {
  const severityColors = {
    CRITICAL: 'border-red-500 bg-red-500/5',
    HIGH: 'border-amber-500 bg-amber-500/5',
    MEDIUM: 'border-blue-500 bg-blue-500/5',
    LOW: 'border-gray-500 bg-gray-500/5',
  };

  const handleClick = () => {
    if (!alert.read) {
      alertAPI.markRead(alert.id);
      onRead(alert.id);
    }
  };

  return (
    <div
      className={clsx(
        'p-4 border-l-4 rounded-r-lg mb-2 cursor-pointer transition-all hover:bg-gray-700/50',
        severityColors[alert.severity] || severityColors.LOW,
        !alert.read && 'ring-1 ring-blue-500/30'
      )}
      onClick={handleClick}
      role="article"
      aria-label={`Alert: ${alert.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {alert.priority && <PriorityBadge priority={alert.priority} size="sm" />}
            <span className="text-xs text-gray-400">{formatTimeAgo(alert.createdAt)}</span>
            {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </div>
          <h4 className="font-medium text-white text-sm truncate">{alert.title}</h4>
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">{alert.message}</p>
        </div>
      </div>
      {alert.actionRequired && (
        <div className="mt-2 pt-2 border-t border-gray-700">
          <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            Take Action →
          </button>
        </div>
      )}
    </div>
  );
}

function AlertFeed({ onAlertRead }) {
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      try {
        const response = await alertAPI.getAll({ limit: 50 });
        return response.data;
      } catch (error) {
        // Return null to use mock data
        console.log('Using mock alert data (backend unavailable)');
        return null;
      }
    },
    refetchInterval: 30000,
    retry: 1,
  });

  // Mock data for demo
  const mockAlerts = [
    {
      id: 1,
      title: 'New P1 Emergency',
      message: 'Cardiac arrest reported at 123 Main St. Ambulance A-12 dispatched.',
      severity: 'CRITICAL',
      priority: 'P1',
      read: false,
      actionRequired: true,
      createdAt: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 2,
      title: 'Hospital Capacity Alert',
      message: 'City General ICU at 95% capacity. Consider alternate routing.',
      severity: 'HIGH',
      read: false,
      actionRequired: false,
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 3,
      title: 'Ambulance En Route',
      message: 'A-07 en route to emergency #1234. ETA 8 minutes.',
      severity: 'MEDIUM',
      priority: 'P2',
      read: true,
      actionRequired: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 4,
      title: 'AI Triage Complete',
      message: 'Triage assessment ready for emergency #1233. Awaiting doctor confirmation.',
      severity: 'MEDIUM',
      read: true,
      actionRequired: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const displayAlerts = alerts || mockAlerts;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">Live Alerts</h3>
        <button
          onClick={() => alertAPI.markAllRead()}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Mark all read
        </button>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 mx-auto text-gray-600 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-400">No alerts</p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onRead={onAlertRead} />
          ))
        )}
      </div>
    </div>
  );
}

export default AlertFeed;
