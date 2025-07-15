import { useState, useEffect } from 'react';

export function useNetworkInfo() {
    const [networkInfo, setNetworkInfo] = useState({
        downlink: null,
        effectiveType: null,
        rtt: null,
        saveData: false,
        isSlowConnection: false
    });

    useEffect(() => {
        const updateNetworkInfo = () => {
            if ('connection' in navigator) {
                const connection = navigator.connection;
                const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                       connection.effectiveType === '2g' ||
                                       connection.saveData;
                
                setNetworkInfo({
                    downlink: connection.downlink,
                    effectiveType: connection.effectiveType,
                    rtt: connection.rtt,
                    saveData: connection.saveData,
                    isSlowConnection
                });
            }
        };

        updateNetworkInfo();

        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection.addEventListener('change', updateNetworkInfo);
            
            return () => {
                connection.removeEventListener('change', updateNetworkInfo);
            };
        }
    }, []);

    return networkInfo;
}