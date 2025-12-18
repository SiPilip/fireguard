'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FaBell, FaTimes, FaCheck, FaExclamationCircle, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

interface Notification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    report_id?: number;
    is_read: boolean;
    created_at: string;
}

interface NotificationBellProps {
    onViewReport?: (reportId: number) => void;
}

export default function NotificationBell({ onViewReport }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Polling setiap 30 detik
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (notificationId: number) => {
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_read', notificationId }),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        setIsLoading(true);
        try {
            await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'mark_all_read' }),
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        if (notification.report_id && onViewReport) {
            onViewReport(notification.report_id);
            setIsOpen(false);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'status_update':
                return <FaExclamationCircle className="text-blue-500" />;
            case 'success':
                return <FaCheckCircle className="text-green-500" />;
            case 'warning':
                return <FaExclamationCircle className="text-yellow-500" />;
            case 'error':
                return <FaExclamationCircle className="text-red-500" />;
            default:
                return <FaInfoCircle className="text-gray-500" />;
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Baru saja';
        if (minutes < 60) return `${minutes} menit lalu`;
        if (hours < 24) return `${hours} jam lalu`;
        if (days < 7) return `${days} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                aria-label="Notifications"
            >
                <FaBell className={`text-lg ${unreadCount > 0 ? 'text-orange-500' : 'text-gray-600'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-red-500 to-orange-500">
                        <div className="flex items-center gap-2">
                            <FaBell className="text-white" />
                            <h3 className="font-semibold text-white">Notifikasi</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                                    {unreadCount} baru
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={isLoading}
                                className="text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <FaCheck />
                                Tandai semua
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50/50' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className={`text-sm font-medium ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {formatTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <FaBell className="text-4xl text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Belum ada notifikasi</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 5 && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-center text-gray-500">
                                Menampilkan {notifications.length} notifikasi terakhir
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
