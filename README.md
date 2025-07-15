# Smart Air Quality Monitor 🌍

This project is developed as part of a Frontend Engineer assignment, focusing on solving the real-life problem of monitoring air quality. The application provides users with real-time air quality data, leveraging modern web technologies and APIs to deliver an interactive and informative experience.

## Features ✨

- **Dummy Air Quality Data**
  - Current AQI with color-coded status
  - Detailed pollutant measurements
  - Location-based automatic updates

- **Location Tracking**
  - Precise geolocation with reverse geocoding
  - City, state, and country information
  - Accuracy tracking and periodic updates

- **Historical Data**
  - 7-day AQI trend visualization
  - Interactive chart display
  - Historical records with timestamps

- **Modern UI/UX**
  - Responsive design for all devices
  - Smooth animations and transitions
  - Dark mode support
  - Network status monitoring

## Tech Stack 🛠

- React.js
- Modern JavaScript (ES6+)
- CSS3 with CSS Variables
- HTML5 Geolocation API
- Canvas for Charts
- OpenStreetMap API
- Docker

## Prerequisites 📋

- Node.js (v14 or higher)
- npm or yarn
- Docker (for containerized deployment)

## Local Development 💻

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-air-quality-monitor.git
   cd smart-air-quality-monitor
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Docker Deployment 🐳

1. Build the Docker image:
   ```bash
   docker build -t air-quality-monitor .
   ```

2. Run the container:
   ```bash
   docker run -d -p 80:80 air-quality-monitor
   ```

3. Access the application at [http://localhost](http://localhost)


## Troubleshooting 🔍

Common issues and solutions:

**Geolocation not working**
   - Ensure HTTPS is enabled
   - Check browser permissions
   - Verify GPS/location services are enabled

## Acknowledgments 👏

- OpenStreetMap for location data
- Air Quality Open Data Platform
- React community
- All contributors

---
