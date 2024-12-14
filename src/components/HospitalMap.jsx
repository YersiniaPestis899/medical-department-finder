import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

export function HospitalMap({ department, onError }) {
  const [currentPosition, setCurrentPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [map, setMap] = useState(null);

  // 位置情報の取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
          searchNearbyHospitals(pos, department);
        },
        (error) => {
          onError('位置情報の取得に失敗しました');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      onError('お使いのブラウザは位置情報に対応していません');
    }
  }, [department]);

  // 近くの病院を検索
  const searchNearbyHospitals = useCallback(async (position, department) => {
    if (!position || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);
    const request = {
      location: position,
      radius: '5000', // 5km圏内
      type: 'hospital',
      keyword: department // 診療科で検索
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setHospitals(results);
      } else {
        onError('病院情報の取得に失敗しました');
      }
    });
  }, [map]);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-purple-600 mb-4">
        近くの病院
      </h3>
      <LoadScript
        googleMapsApiKey={import.meta.env.GOOGLE_MAPS_API_KEY}
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition || { lat: 35.6812, lng: 139.7671 }} // デフォルトは東京
          zoom={14}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* 現在位置のマーカー */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
              }}
            />
          )}

          {/* 病院のマーカー */}
          {hospitals.map((hospital) => (
            <Marker
              key={hospital.place_id}
              position={hospital.geometry.location}
              onClick={() => setSelectedHospital(hospital)}
            />
          ))}

          {/* 病院の情報ウィンドウ */}
          {selectedHospital && (
            <InfoWindow
              position={selectedHospital.geometry.location}
              onCloseClick={() => setSelectedHospital(null)}
            >
              <div className="p-2">
                <h4 className="font-bold text-lg">{selectedHospital.name}</h4>
                <p className="text-sm text-gray-600">{selectedHospital.vicinity}</p>
                {selectedHospital.rating && (
                  <p className="text-sm">評価: {selectedHospital.rating}⭐</p>
                )}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.geometry.location.lat()},${selectedHospital.geometry.location.lng()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  ルートを表示 🗺️
                </a>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}