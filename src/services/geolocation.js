export const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(new Error('Unable to retrieve your location'));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    });
};

export const getLocationDetails = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();

        return {
            city: data.address.city || data.address.town || data.address.village || 'Unknown City',
            state: data.address.state || 'Unknown State',
            country: data.address.country || 'Unknown Country',
            displayName: data.display_name || 'Unknown Location'
        };
    } catch (error) {
        console.error('Error getting location details:', error);
        return {
            city: 'Unknown City',
            state: 'Unknown State',
            country: 'Unknown Country',
            displayName: 'Unknown Location'
        };
    }
};

export function watchPosition(callback, errorCallback) {
    if (!navigator.geolocation) {
        errorCallback(new Error('Geolocation not supported'));
        return null;
    }

    return navigator.geolocation.watchPosition(
        pos => callback({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
        }),
        errorCallback,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // 1 minute
        }
    );
}

export function clearWatch(watchId) {
    if (navigator.geolocation && watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
}