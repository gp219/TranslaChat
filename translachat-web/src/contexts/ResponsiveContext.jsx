/* eslint-disable react-refresh/only-export-components */
import React, { useContext, useState, useEffect } from 'react';

import { ResponsiveContext } from './ResponsiveContextDefinition';

export const ResponsiveProvider = ({ children }) => {
    // Standard Tailwind threshold for md is 768px
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ResponsiveContext.Provider value={{ isMobile }}>
            {children}
        </ResponsiveContext.Provider>
    );
};

export const useResponsive = () => useContext(ResponsiveContext);