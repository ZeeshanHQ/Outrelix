import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const audioContextRef = useRef(null);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setNotifications(parsed);
                setUnreadCount(parsed.filter(n => !n.read).length);
            } catch (e) {
                console.error('Failed to parse notifications', e);
            }
        }

        // Request browser notification permission
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const playTickSound = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const context = audioContextRef.current;
            if (context.state === 'suspended') {
                context.resume();
            }

            const oscillator = context.createOscillator();
            const gainNode = context.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1000, context.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.05, context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);

            oscillator.connect(gainNode);
            gainNode.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 0.1);
        } catch (err) {
            console.error('Sound play failed:', err);
        }
    }, []);

    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev].slice(0, 50));

        // 1. Play premium tick sound
        playTickSound();

        // 2. Browser native notification
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Outrelix Update", {
                body: notification.message || "New notification received",
                icon: "/logo192.png" // Fallback to standard react logo icon if custom not found
            });
        }

        // 3. Trigger custom event for bell animation
        window.dispatchEvent(new CustomEvent('new-notification'));
    }, [playTickSound]);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
