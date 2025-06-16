# RainCheck - React Frontend Setup Instructions

This guide will help you set up the RainCheck application, a minimal and elegant React frontend for your rainfall prediction service.

## Prerequisites

- Node.js (v14.0.0 or higher)
- npm or yarn
- Your Flask backend API running (default: http://localhost:5000)
- OpenWeather API key ([Get one here](https://openweathermap.org/api))

## Project Structure

```
raincheck/
├── public/
│   └── droplet.svg
├── src/
│   ├── components/
│   │   ├── Footer.jsx
│   │   └── HistoricalDataVisualizer.jsx
│   │   └── LoadingState.jsx
│   │   └── Map.jsx
│   │   └── Navbar.jsx
│   │   ├── PredictionResult.jsx
│   │   └── ScrollToTop.jsx
│   │   ├── WeatherCard.jsx
│   ├── pages/
│   │   ├── Map.jsx
│   │   ├── HistoricalData.jsx
│   │   ├── HomePage.jsx
│   │   └── PredictionPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Setup Steps

1. **Create a new Vite project with React**

```bash
npm create vite@latest raincheck -- --template react
cd raincheck
```

2. **Install dependencies**

```bash
npm install leaflet lucide-react react-router-dom react-select recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

3. **Copy the files from the artifacts to their respective locations**

- Create the component files in `src/components/`
- Replace the content of `App.jsx`, `main.jsx`, and `index.css`
- Update `vite.config.js`, `index.html`, and `tailwind.config.js`
- Create `public/droplet.svg` with the provided SVG code

4. **Add your OpenWeather API key**

Open `src/App.jsx` and replace:

```javascript
const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';
```

With your actual OpenWeather API key:

```javascript
const OPENWEATHER_API_KEY = '1234567890abcdef';
```

5. **Make sure your Flask backend is running**

Ensure your Flask backend from the pasted file is running at http://localhost:5000. If it's running on a different URL or port, update the `PREDICTION_API_URL` in `App.jsx` accordingly.

6. **Start the development server**

```bash
npm run dev
```

This will start the Vite development server, typically at http://localhost:3000.

## Features

- **User Location**: Automatically uses the user's current location on startup
- **Interactive Map**: Click anywhere on the map to select a different location
- **Real-time Weather Data**: Fetches current weather conditions from OpenWeather API
- **Rainfall Prediction**: Sends the weather data to your prediction API
- **Responsive Design**: Works on mobile and desktop devices
- **Elegant UI**: Clean and minimal interface with Tailwind CSS styling

## Customization

- **Colors**: Edit the Tailwind classes in the components to change the color scheme
- **API Endpoints**: Modify the API URLs in `App.jsx` if your services are hosted elsewhere
- **Map Provider**: The app uses OpenStreetMap by default, but you can change the tile provider in `Map.jsx`

## Building for Production

When you're ready to deploy the application:

```bash
npm run build
```

This will create an optimized build in the `dist` directory that you can deploy to any static hosting service.

## Troubleshooting

- **CORS Issues**: If you encounter CORS errors, make sure your Flask API has CORS properly configured (it should with the provided code)
- **API Key Errors**: Double-check that your OpenWeather API key is valid and has the correct permissions
- **Map Loading Issues**: Ensure that your browser allows loading the map tiles from OpenStreetMap

Happy coding!