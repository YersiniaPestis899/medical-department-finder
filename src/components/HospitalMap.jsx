import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const libraries = ['places'];

const containerStyle = {
  width: '100%',
  height: '400px'
};

const customMarkers = {
  currentLocation: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: { width: 32, height: 32 }
  },
  hospital: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 }
  }
};

export function HospitalMap({ department, onError }) {
  const mapRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [iOSInstructions, setIOSInstructions] = useState(false);

  // iOS端末の判定
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
                /CriOS/.test(navigator.userAgent); // Chrome for iOSの判定

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentPosition(pos);
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = isIOS 
                ? 'この機能には位置情報の許可が必要です。iPhoneの設定から位置情報を許可してください。'
                : '位置情報の許可が必要です';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置情報を取得できませんでした';
              break;
            case error.TIMEOUT:
              errorMessage = '位置情報の取得がタイムアウトしました';
              break;
            default:
              errorMessage = 'エラーが発生しました: ' + error.message;
          }
          onError(errorMessage);
          setLoading(false);
        },
        options
      );
    } else {
      onError('お使いのブラウザは位置情報に対応していません');
      setLoading(false);
    }
  }, [isIOS, onError]);

  useEffect(() => {
    if (!isLoaded) return;
    getLocation();
  }, [isLoaded, getLocation]);

  // 病院検索
  const searchNearbyHospitals = useCallback(async () => {
    if (!mapRef.current || !currentPosition || !window.google) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: currentPosition,
      radius: '5000',
      type: 'hospital',
      keyword: department
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setHospitals(results);
      } else {
        onError('病院情報の取得に失敗しました: ' + status);
        console.error('Places API error:', status);
      }
    });
  }, [currentPosition, department]);

  const onLoad = useCallback((map) => {
    mapRef.current = map;
    if (currentPosition) {
      searchNearbyHospitals();
    }
  }, [currentPosition, searchNearbyHospitals]);

  // エラー処理とローディング表示
  if (loadError) {
    return (
      <div className="text-red-500 p-4 text-center">
        地図の読み込みに失敗しました。
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin text-4xl">🏥</div>
      </div>
    );
  }

  // 位置情報が取得できない場合
  if (!currentPosition) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">位置情報を取得できませんでした</p>
        {isIOS && (
          <>
            <button 
              onClick={() => setIOSInstructions(!iOSInstructions)}
              className="text-blue-500 underline"
            >
              iPhoneでの位置情報の設定方法を見る
            </button>
            
            {iOSInstructions && (
              <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">iPhoneでの位置情報設定手順:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>「設定」アプリを開く</li>
                  <li>「Chrome」を選択</li>
                  <li>「位置情報」をタップ</li>
                  <li>「位置情報を許可」を選択</li>
                  <li>アプリを再読み込みする</li>
                </ol>
                <button 
                  onClick={getLocation}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  位置情報を再取得する
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // 地図表示
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-purple-600 mb-4">
        近くの病院
      </h3>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={currentPosition}
        zoom={14}
        onLoad={onLoad}
      >
        {/* 現在位置のマーカー */}
        <Marker
          position={currentPosition}
          icon={customMarkers.currentLocation}
        />

        {/* 病院のマーカー */}
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.place_id}
            position={hospital.geometry.location}
            icon={customMarkers.hospital}
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
              <div className="mt-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.geometry.location.lat()},${selectedHospital.geometry.location.lng()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  ルートを表示 <span className="text-lg">🗺️</span>
                </a>
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}