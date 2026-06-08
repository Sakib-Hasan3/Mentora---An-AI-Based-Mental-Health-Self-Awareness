import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get(`/notifications/?page=${page}&limit=20`);
            if (page === 1) {
                setNotifications(data.notifications || []);
            } else {
                setNotifications(prev => [...prev, ...(data.notifications || [])]);
            }
            setUnreadCount(data.unread_count || 0);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [page]);

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map(n => 
                n.id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
            const deletedNotif = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (deletedNotif && !deletedNotif.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            setTotal(prev => prev - 1);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const loadMore = () => {
        if (notifications.length < total && !loading) {
            setPage(prev => prev + 1);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        total,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh: fetchNotifications
    };
};
