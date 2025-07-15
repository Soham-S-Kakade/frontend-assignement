// Mock API for demonstration (in real app, use actual air quality API)
const mockAirQualityData = {
    generateData: (lat, lng) => ({
        location: { lat, lng },
        aqi: Math.floor(Math.random() * 300) + 1,
        pm25: Math.floor(Math.random() * 100) + 1,
        pm10: Math.floor(Math.random() * 150) + 1,
        no2: Math.floor(Math.random() * 80) + 1,
        o3: Math.floor(Math.random() * 120) + 1,
        co: Math.floor(Math.random() * 50) + 1,
        timestamp: Date.now(),
        city: 'Current Location'
    })
};

export async function fetchAirQualityData(lat, lng) {
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In a real application, you would use:
        // const response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=YOUR_API_KEY`);
        
        return mockAirQualityData.generateData(lat, lng);
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        throw error;
    }
}

export async function fetchHistoricalData(lat, lng, days = 7) {
    try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const historicalData = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            historicalData.push({
                ...mockAirQualityData.generateData(lat, lng),
                timestamp: date.getTime(),
                date: date.toISOString().split('T')[0]
            });
        }
        
        return historicalData;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        throw error;
    }
}

export function getAQIStatus(aqi) {
    if (aqi <= 50) return { level: 'Good', color: '#00e400', description: 'Air quality is considered satisfactory' };
    if (aqi <= 100) return { level: 'Moderate', color: '#ffff00', description: 'Air quality is acceptable for most people' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', color: '#ff7e00', description: 'Sensitive individuals may experience problems' };
    if (aqi <= 200) return { level: 'Unhealthy', color: '#ff0000', description: 'Everyone may begin to experience health effects' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: '#8f3f97', description: 'Health warnings of emergency conditions' };
    return { level: 'Hazardous', color: '#7e0023', description: 'Health alert: everyone may experience serious health effects' };
}