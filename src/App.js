import React, { useState, useEffect, lazy, Suspense, useMemo, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MapPin, Wifi, Activity, TrendingUp, AlertTriangle, CheckCircle, Navigation, RefreshCcw, Sun, Moon } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { getCurrentPosition, getLocationDetails } from './services/geolocation';
import { fetchAirQualityData, fetchHistoricalData, getAQIStatus } from './services/airQuality';
import { useNetworkInfo } from './services/useNetworkInfo';
import { useIntersectionObserver } from './hooks/useIntersectionObserver';
import { backgroundTaskManager } from './utils/backgroundTask';
import './App.css';

// Lazy load components
const CanvasChart = lazy(() => import('./components/CanvasChart'));

// Memoized components
const LocationCard = React.memo(({ location, lastUpdated, locationDetails }) => (
  <div className="card location-card">
    <div className="card-header">
      <MapPin size={25} />
      <h2>Current Location</h2>
    </div>
    <div className="location-info">
      <p><strong>Latitude:</strong> {location?.lat.toFixed(4)}</p>
      <p><strong>Longitude:</strong> {location?.lng.toFixed(4)}</p>
      <p><strong>City:</strong> {locationDetails?.city}</p>
      <p><strong>State:</strong> {locationDetails?.state}</p>
      <p><strong>Country:</strong> {locationDetails?.country}</p>
      <p className="last-updated"><strong>Last Updated:</strong> {lastUpdated?.toLocaleTimeString()}</p>
    </div>
  </div>
));

const AQICard = React.memo(({ currentData, aqiStatus, onRefresh, isRefreshing }) => (
  <div className="card aqi-card">
    <div className="card-header">
      <Activity size={25} />
      <h2>Air Quality Index</h2>
      <button
        onClick={onRefresh}
        className={`refresh-button ${isRefreshing ? 'loading' : ''}`}
        disabled={isRefreshing}
      >
        <RefreshCcw size={20} />
      </button>
    </div>
    <div className="aqi-main">
      <div className="aqi-circle" style={{ borderColor: aqiStatus?.color }}>
        <span className="aqi-value">{currentData.aqi}</span>
        <span className="aqi-label">AQI</span>
      </div>
      <div className="aqi-info">
        <h3 style={{ color: aqiStatus?.color }}>{aqiStatus?.level}</h3>
        <p>{aqiStatus?.description}</p>
      </div>
    </div>
    <div className="pollutants-grid">
      {Object.entries({
        'PM2.5': currentData.pm25,
        'PM10': currentData.pm10,
        'NO₂': currentData.no2,
        'O₃': currentData.o3
      }).map(([name, value]) => (
        <div key={name} className="pollutant">
          <span className="pollutant-name">{name}</span>
          <span className="pollutant-value">{value} μg/m³</span>
        </div>
      ))}
    </div>
  </div>
));

function AppContent() {
  const { isDark, toggleTheme } = useTheme();
  const [location, setLocation] = useState(null);
  const [locationDetails, setLocationDetails] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const mainRef = useRef(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const networkInfo = useNetworkInfo();
  const { targetRef: chartRef, hasIntersected: chartVisible } = useIntersectionObserver();
  const { targetRef: historyRef, hasIntersected: historyVisible } = useIntersectionObserver();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        const scrolled = mainRef.current.scrollTop > 20;
        setIsHeaderScrolled(scrolled);
      }
    };

    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Memoize functions
  const initializeApp = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const position = await getCurrentPosition();
      setLocation(position);

      // Get location details
      const details = await getLocationDetails(position.lat, position.lng);
      setLocationDetails(details);

      const airQualityData = await fetchAirQualityData(position.lat, position.lng);
      setCurrentData(airQualityData);
      setLastUpdated(new Date());

      backgroundTaskManager.scheduleTask(async () => {
        try {
          const historical = await fetchHistoricalData(position.lat, position.lng);
          setHistoricalData(historical);
        } catch (err) {
          console.error('Failed to fetch historical data:', err);
        }
      }, 'low');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (location && !isRefreshing) {
      setIsRefreshing(true);
      try {
        const airQualityData = await fetchAirQualityData(location.lat, location.lng);
        setCurrentData(airQualityData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to refresh data:', err);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [location, isRefreshing]);

  // Memoize computed values
  const formattedChartData = useMemo(() =>
    historicalData.map((item) => ({
      label: new Date(item.timestamp).toLocaleDateString(),
      value: item.aqi
    })), [historicalData]);

  const networkStatus = useMemo(() => {
    if (!networkInfo.effectiveType) return 'Unknown';
    return networkInfo.isSlowConnection ? 'Slow Connection' : 'Good Connection';
  }, [networkInfo.effectiveType, networkInfo.isSlowConnection]);

  const aqiStatus = useMemo(() =>
    currentData ? getAQIStatus(currentData.aqi) : null,
    [currentData]
  );

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Getting your location and air quality data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <AlertTriangle className="error-icon" />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={initializeApp} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route path="/home" element={
          <>
            <header className={`app-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
              <h1>🌍 Smart Air Quality Monitor</h1>
              <div className="header-right">
                <div className="network-status">
                  <Wifi size={16} />
                  <span>{networkStatus}</span>
                </div>
                {/*To-Do: Add theme toggle button */}
              </div>
            </header>

            <main className="app-main" ref={mainRef}>
              <LocationCard
                location={location}
                lastUpdated={lastUpdated}
                locationDetails={locationDetails}
              />

              {currentData && (
                <AQICard
                  currentData={currentData}
                  aqiStatus={aqiStatus}
                  onRefresh={refreshData}
                  isRefreshing={isRefreshing}
                />
              )}

              <div ref={historyRef} className="card history-card">
                <div className="card-header">
                  <CheckCircle size={25} />
                  <h2>Historical Data</h2>
                </div>
                {historyVisible && historicalData.length > 0 ? (
                  <div className="history-list">
                    {historicalData.slice(0, 5).map((item, index) => (
                      <div key={index} className="history-item">
                        <div className="history-date">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                        <div className="history-aqi">
                          <span
                            className="history-aqi-value"
                            style={{ color: getAQIStatus(item.aqi).color }}
                          >
                            {item.aqi}
                          </span>
                          <span className="history-aqi-level">
                            {getAQIStatus(item.aqi).level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : historyVisible ? (
                  <div className="history-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading historical data...</p>
                  </div>
                ) : (
                  <div className="history-placeholder">
                    <p>Scroll down to load historical data</p>
                  </div>
                )}
              </div>

              <div ref={chartRef} className="card chart-card">
                <div className="card-header">
                  <TrendingUp size={25} />
                  <h2>AQI Trend (7 Days)</h2>
                </div>
                {chartVisible && historicalData.length > 0 ? (
                  <Suspense fallback={<div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading chart...</p>
                  </div>}>
                    <div className="chart-container">
                      <CanvasChart
                        data={formattedChartData}
                        width={800}
                        height={400}
                        type="bar"
                      />
                    </div>
                  </Suspense>
                ) : chartVisible ? (
                  <div className="chart-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading chart data...</p>
                  </div>
                ) : (
                  <div className="chart-placeholder">
                    <p>Scroll down to load chart</p>
                  </div>
                )}
              </div>
            </main>

            <footer className="app-footer">
              <p>Soham's Air Quality Monitor - Built using React</p>
              {networkInfo.effectiveType && (
                <p className="network-info">
                  Connection: {networkInfo.effectiveType} •
                  RTT: {networkInfo.rtt}ms •
                  {networkInfo.saveData && 'Data Saver ON'}
                </p>
              )}
            </footer>
          </>
        } />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;