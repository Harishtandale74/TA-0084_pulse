import { useState } from 'react';
import { useUIStore } from '../../stores/uiStore';
import { ErrorBoundary } from '../common';
import AlertFeed from './AlertFeed';
import AITriagePanel from '../triage/AITriagePanel';
import ChatPanel from './ChatPanel';
import clsx from 'clsx';

const tabs = [
  { id: 'alerts', label: 'Alerts', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )},
  { id: 'triage', label: 'AI Triage', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )},
  { id: 'chat', label: 'Chat', icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
];

function RightPanel() {
  const { rightPanelTab, setRightPanelTab } = useUIStore();
  const [unreadAlerts, setUnreadAlerts] = useState(3);

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setRightPanelTab(tab.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
              rightPanelTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 -mb-px'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            )}
            aria-selected={rightPanelTab === tab.id}
            role="tab"
          >
            {tab.icon}
            <span className="hidden lg:inline">{tab.label}</span>
            {tab.id === 'alerts' && unreadAlerts > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlerts}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <ErrorBoundary
          title="Panel Error"
          message="This panel failed to load."
        >
          {rightPanelTab === 'alerts' && (
            <AlertFeed onAlertRead={() => setUnreadAlerts((prev) => Math.max(0, prev - 1))} />
          )}
          {rightPanelTab === 'triage' && <AITriagePanel />}
          {rightPanelTab === 'chat' && <ChatPanel />}
        </ErrorBoundary>
      </div>
    </div>
  );
}

export default RightPanel;
