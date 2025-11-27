import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const MapSelector = ({ onLocationSelect, initialPosition }) => {
  // Default to Riyadh, Saudi Arabia if no initial position
  const defaultPosition = initialPosition || { lat: 24.7136, lng: 46.6753 };
  const [position, setPosition] = useState(defaultPosition);

  useEffect(() => {
    if (position && position.lat && position.lng && typeof onLocationSelect === 'function') {
      onLocationSelect(position);
    }
  }, [position]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-slate-600">
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      {position && (
        <div className="mt-2 text-xs text-gray-400">
          Selected Location: Lat {position.lat.toFixed(6)}, Lng {position.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapSelector;
