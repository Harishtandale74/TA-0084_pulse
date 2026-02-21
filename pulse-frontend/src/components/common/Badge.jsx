import clsx from 'clsx';

const priorityConfig = {
  P1: {
    label: 'Critical',
    className: 'badge-critical',
    dotColor: 'bg-red-500',
  },
  P2: {
    label: 'Urgent',
    className: 'badge-urgent',
    dotColor: 'bg-amber-500',
  },
  P3: {
    label: 'Delayed',
    className: 'badge-delayed',
    dotColor: 'bg-blue-500',
  },
  P4: {
    label: 'Minor',
    className: 'badge-minor',
    dotColor: 'bg-gray-500',
  },
};

function PriorityBadge({ priority, showLabel = true, size = 'md' }) {
  const config = priorityConfig[priority] || priorityConfig.P4;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={clsx(config.className, sizeClasses[size])}
      role="status"
      aria-label={`Priority: ${config.label}`}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {showLabel && <span>{priority}</span>}
    </span>
  );
}

function StatusBadge({ status, size = 'md' }) {
  const statusConfig = {
    ACTIVE: { label: 'Active', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    EN_ROUTE: { label: 'En Route', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    ON_SCENE: { label: 'On Scene', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    TRANSPORTING: { label: 'Transporting', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    RESOLVED: { label: 'Resolved', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
    AVAILABLE: { label: 'Available', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
    DISPATCHED: { label: 'Dispatched', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    OFF_DUTY: { label: 'Off Duty', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  };

  const config = statusConfig[status] || { label: status, className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span className={clsx('badge border', config.className, sizeClasses[size])}>
      {config.label}
    </span>
  );
}

export { PriorityBadge, StatusBadge, priorityConfig };
export default PriorityBadge;
