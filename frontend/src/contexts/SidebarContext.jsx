import React, { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Auto-collapse on smaller desktop screens if needed, or persist user preference
    useEffect(() => {
        const savedState = localStorage.getItem('sidebar-collapsed');
        if (savedState) {
            setIsCollapsed(JSON.parse(savedState));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    };

    const toggleMobileCursor = () => setIsMobileOpen(!isMobileOpen);
    const closeMobile = () => setIsMobileOpen(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isMobileOpen, toggleMobileCursor, closeMobile }}>
            {children}
        </SidebarContext.Provider>
    );
};
