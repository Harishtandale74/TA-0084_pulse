import { useUIStore } from '../../stores/uiStore';
import clsx from 'clsx';

function ConnectionStatus() {
  const { connectionStatus } = useUIStore();

  const statusConfig = {
    connected: {
      label: 'Connected',
      className: 'connection-connected',
      srText: 'Real-time connection is active',
    },
    connecting: {
      label: 'Connecting...',
      className: 'connection-connecting',
      srText: 'Attempting to establish real-time connection',
    },
    disconnected: {
      label: 'Disconnected',
      className: 'connection-disconnected',
      srText: 'Real-time connection lost',
    },
  };

  const config = statusConfig[connectionStatus] || statusConfig.disconnected;

  // Only show when not connected
  if (connectionStatus === 'connected') {
    return null;
  }

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-full shadow-lg"
      role="status"
      aria-live="polite"
    >
      <span className={clsx('connection-indicator', config.className)} />
      <span className="text-sm text-gray-300">{config.label}</span>
      <span className="sr-only">{config.srText}</span>
    </div>
  );
}

export default ConnectionStatus;
