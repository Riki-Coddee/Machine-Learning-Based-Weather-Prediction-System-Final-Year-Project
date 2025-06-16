"use client"

import { useEffect, useRef } from "react"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for marker icons in Leaflet with Vite/React
import icon from "leaflet/dist/images/marker-icon.png"
import iconShadow from "leaflet/dist/images/marker-shadow.png"

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const Map = ({ location, onLocationSelect }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const isInitializedRef = useRef(false)

  useEffect(() => {
    // Only initialize if we have valid coordinates
    if (!mapInstanceRef.current && location.lat && location.lng) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([location.lat, location.lng], 13)

      // Add tile layer (map imagery)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current)

      // Add marker for initial location
      markerRef.current = L.marker([location.lat, location.lng]).addTo(mapInstanceRef.current)

      // Add click handler to map
      mapInstanceRef.current.on("click", (e) => {
        const newLocation = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }

        // Update marker position
        markerRef.current.setLatLng(e.latlng)

        // Call the callback with new location
        onLocationSelect(newLocation)
      })

      isInitializedRef.current = true
    } else if (mapInstanceRef.current && location.lat && location.lng) {
      // If map exists but location changed, update view and marker
      mapInstanceRef.current.setView([location.lat, location.lng], 13)
      if (markerRef.current) {
        markerRef.current.setLatLng([location.lat, location.lng])
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update marker position if location prop changes externally
  useEffect(() => {
    if (
      markerRef.current &&
      (markerRef.current.getLatLng().lat !== location.lat || markerRef.current.getLatLng().lng !== location.lng)
    ) {
      markerRef.current.setLatLng([location.lat, location.lng])
      mapInstanceRef.current.setView([location.lat, location.lng], 13)
    }
  }, [location])

  // Only render the map if we have a location
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500 text-sm">Waiting for location data...</p>
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: "100%", height: "100%", zIndex: 0 }} />
}

export default Map
