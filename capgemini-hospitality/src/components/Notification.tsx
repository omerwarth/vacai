 'use client';

import { useEffect, useState } from 'react';

type NotificationStatus = 'success' | 'warning' | 'error' | 'info' | 'reminder' | 'system';

type Notification = {
  id: string;
  status: NotificationStatus;
  title: string;
  message: string;
  date: string;
  isRead?: boolean;
};

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: (hasUnread: boolean) => void;
};

// Sample notifications with different statuses
const sampleNotifications: Notification[] = [
  {
    id: '1',
    status: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance from 11:00 PM - 1:00 AM UTC. Some features may be temporarily unavailable.',
    date: 'Oct 23, 2025',
    isRead: false
  },
  {
    id: '2',
    status: 'success',
    title: 'Booking Confirmed',
    message: 'Your trip to Paris has been successfully booked! Confirmation #TR-2025-001.',
    date: 'Oct 22, 2025',
    isRead: false
  },
  {
    id: '3',
    status: 'warning',
    title: 'Payment Reminder',
    message: 'Your payment for the Tokyo trip is due in 3 days. Please complete payment to secure your booking.',
    date: 'Oct 21, 2025',
    isRead: true
  },
  {
    id: '4',
    status: 'error',
    title: 'Booking Failed',
    message: 'Unable to process your London trip booking. Please check your payment method and try again.',
    date: 'Oct 20, 2025',
    isRead: true
  },
  {
    id: '5',
    status: 'info',
    title: 'New Feature Available',
    message: 'Try our new itinerary comparison feature! Compare up to 3 travel plans side by side.',
    date: 'Oct 19, 2025',
    isRead: true
  },
  {
    id: '6',
    status: 'reminder',
    title: 'Upcoming Trip',
    message: 'Your Barcelona adventure starts in 7 days! Don\'t forget to check in online.',
    date: 'Oct 18, 2025',
    isRead: true
  }
];

function getNotificationIcon(status: NotificationStatus): string {
  switch (status) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
      return 'ℹ️';
    case 'reminder':
      return '🔔';
    case 'system':
      return '⚙️';
    default:
      return '📌';
  }
}

function getNotificationColors(status: NotificationStatus): {
  bg: string;
  border: string;
  text: string;
  badge: string;
} {
  switch (status) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-700/50',
        text: 'text-green-800 dark:text-green-200',
        badge: 'bg-green-100 dark:bg-green-800/30 text-green-800 dark:text-green-200'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-700/50',
        text: 'text-yellow-800 dark:text-yellow-200',
        badge: 'bg-yellow-100 dark:bg-yellow-800/30 text-yellow-800 dark:text-yellow-200'
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-700/50',
        text: 'text-red-800 dark:text-red-200',
        badge: 'bg-red-100 dark:bg-red-800/30 text-red-800 dark:text-red-200'
      };
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-700/50',
        text: 'text-blue-800 dark:text-blue-200',
        badge: 'bg-blue-100 dark:bg-blue-800/30 text-blue-800 dark:text-blue-200'
      };
    case 'reminder':
      return {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-700/50',
        text: 'text-purple-800 dark:text-purple-200',
        badge: 'bg-purple-100 dark:bg-purple-800/30 text-purple-800 dark:text-purple-200'
      };
    case 'system':
      return {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-600/50',
        text: 'text-gray-800 dark:text-gray-200',
        badge: 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-200'
      };
    default:
      return {
        bg: 'bg-white/80 dark:bg-gray-800/80',
        border: 'border-gray-100 dark:border-gray-700',
        text: 'text-gray-800 dark:text-gray-200',
        badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
      };
  }
}

export function NotificationModal({ isOpen, onClose, onNotificationRead }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Notify parent component when notification read status changes
  useEffect(() => {
    const hasUnread = notifications.some(n => !n.isRead);
    onNotificationRead?.(hasUnread);
  }, [notifications, onNotificationRead]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  if (!isOpen) return null;

  // Group notifications by read status
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true"></div>

      <div className="relative max-w-md w-full mx-4">
        <div className="rounded-2xl shadow-2xl overflow-hidden relative border border-sky-100 dark:border-gray-700 max-h-[85vh] w-full bg-gradient-to-br from-white/60 to-sky-50/40 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-sm">
          <div className="p-6 pb-0">
            <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={onClose} 
                className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors" 
                aria-label="Close notifications dialog"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-sky-600 dark:bg-sky-700 flex items-center justify-center text-white">
                🔔
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-sky-800 dark:text-sky-200">Notifications</h2>
                <p className="text-sm text-sky-700 dark:text-sky-300">Recent activity and system messages</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="px-6 overflow-auto max-h-[55vh] notifications-scroll">
              <div className="space-y-4 pr-3">
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      New ({unreadNotifications.length})
                    </h3>
                    <div className="space-y-3">
                      {unreadNotifications.map((notification) => {
                        const colors = getNotificationColors(notification.status);
                        const icon = getNotificationIcon(notification.status);
                        
                        return (
                          <div 
                            key={notification.id} 
                            className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border} hover:shadow-md transition-all duration-200`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.badge}`}>
                                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{notification.date}</span>
                                </div>
                                <h4 className={`font-semibold text-sm ${colors.text} mb-1`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                                  {notification.message}
                                </p>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs px-3 py-1.5 rounded-md bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-800/50 transition-colors font-medium border border-sky-200 dark:border-sky-700/50"
                                  >
                                    Mark as Read
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Read Notifications */}
                {readNotifications.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      Earlier ({readNotifications.length})
                    </h3>
                    <div className="space-y-3">
                      {readNotifications.map((notification) => {
                        const colors = getNotificationColors(notification.status);
                        const icon = getNotificationIcon(notification.status);
                        
                        return (
                          <div 
                            key={notification.id} 
                            className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border} opacity-75 hover:opacity-100 hover:shadow-md transition-all duration-200 cursor-pointer`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5 opacity-60">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.badge} opacity-75`}>
                                    {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">{notification.date}</span>
                                </div>
                                <h4 className={`font-semibold text-sm ${colors.text} mb-1 opacity-75`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed opacity-75">
                                  {notification.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {notifications.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔕</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">No notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-500">You&apos;re all caught up!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Action Buttons - Always Visible */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm flex-shrink-0">
              <button 
                onClick={markAllAsRead}
                className="w-full text-sm px-4 py-2.5 rounded-md bg-sky-600 dark:bg-sky-700 text-white hover:bg-sky-700 dark:hover:bg-sky-600 transition-colors font-medium"
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styles for custom scrollbar with visible, styled scroll wheel
// Styled to be modern and accessible with proper hover states
const _style = (`
.notifications-scroll { 
  scrollbar-width: thin; 
  scrollbar-color: rgba(148, 163, 184, 0.6) rgba(241, 245, 249, 0.3); 
}
.notifications-scroll::-webkit-scrollbar { 
  width: 12px; 
}
.notifications-scroll::-webkit-scrollbar-track { 
  background: rgba(241, 245, 249, 0.3); 
  border-radius: 6px; 
  margin: 4px 0;
}
.notifications-scroll::-webkit-scrollbar-thumb { 
  background: rgba(148, 163, 184, 0.6); 
  border-radius: 6px; 
  border: 2px solid rgba(241, 245, 249, 0.3);
  transition: background-color 0.2s ease;
}
.notifications-scroll::-webkit-scrollbar-thumb:hover { 
  background: rgba(100, 116, 139, 0.8); 
}
.notifications-scroll::-webkit-scrollbar-thumb:active { 
  background: rgba(71, 85, 105, 0.9); 
}
`);

// Inject the style tag into the document at runtime for environments that accept it.
if (typeof document !== 'undefined') {
  if (!document.getElementById('notification-scroll-style')) {
    const s = document.createElement('style');
    s.id = 'notification-scroll-style';
    s.innerHTML = _style;
    document.head.appendChild(s);
  }
}
