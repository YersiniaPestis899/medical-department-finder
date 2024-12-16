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
  const [showInstructions, setShowInstructions] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');

  // iOS と ブラウザの検出を改善
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = isIOS && !userAgent.includes('crios') && !userAgent.includes('fxios');
  const isChrome = userAgent.includes('crios');
  const isFirefox = userAgent.includes('fxios');
  const browserName = isSafari ? 'Safari' : isChrome ? 'Chrome' : isFirefox ? 'Firefox' : '現在のブラウザ';

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  // 位置情報の権限チェックを強化
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.permissions) return 'unknown';
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermissionStatus(result.state);
      return result.state;
    } catch (error) {
      console.error('Permission check failed:', error);
      return 'unknown';
    }
  }, []);

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      onError('お使いのブラウザは位置情報に対応していません');
      setLoading(false);
      return;
    }

    await checkLocationPermission();

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
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
        setLoading(false);

        // iOSデバイス向けのカスタマイズされたエラーメッセージ
        if (isIOS) {
          const browserSpecificMessage = isChrome 
            ? 'Chrome'
            : isSafari 
              ? 'Safari'
              : browserName;

          onError(`位置情報の取得に失敗しました。iOSの${browserSpecificMessage}で位置情報を使用するには、デバイスの設定から位置情報の許可が必要です。`);
        } else {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              onError('位置情報の使用が許可されていません');
              break;
            case error.POSITION_UNAVAILABLE:
              onError('現在地を取得できません');
              break;
            case error.TIMEOUT:
              onError('位置情報の取得がタイムアウトしました');
              break;
            default:
              onError(`位置情報の取得に失敗しました: ${error.message}`);
          }
        }
      },
      options
    );
  }, [isIOS, browserName, onError, checkLocationPermission]);

  useEffect(() => {
    if (!isLoaded) return;
    getLocation();
  }, [isLoaded, getLocation]);

  const getIOSInstructions = useCallback(() => {
    let steps = [
      'iPhoneの「設定」アプリを開く',
      '「プライバシーとセキュリティ」を選択',
      '「位置情報サービス」を選択',
      '位置情報サービスがオンになっていることを確認',
      `「${browserName}」を選択`,
      '「位置情報を許可」で「App使用中は許可」または「常に許可」を選択'
    ];

    if (isChrome) {
      steps.push(
        'Chromeアプリを完全に終了（上スワイプで削除）',
        'Chromeを再起動してページを再読み込み'
      );
    }

    return steps;
  }, [browserName, isChrome]);

  // 近くの病院を検索
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
        onError('病院情報の取得に失敗しました');
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

  if (loadError) {
    return (
      <div className="text-red-500 p-4 text-center">
        地図の読み込みに失敗しました
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

  if (!currentPosition) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">位置情報を取得できませんでした</p>
        {isIOS && (
          <>
            <button 
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-blue-500 underline"
            >
              {`iOSでの${browserName}の設定方法を見る`}
            </button>
            
            {showInstructions && (
              <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
                <h4 className="font-bold mb-2">設定手順:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  {getIOSInstructions().map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-bold">※ 上記の設定後も位置情報が取得できない場合:</p>
                  <ul className="list-disc pl-5 mt-2">
                    <li>iPhoneを再起動してお試しください</li>
                    <li>位置情報サービスが有効になっているか確認してください</li>
                    {!isSafari && <li>Safariブラウザで開いてお試しください</li>}
                  </ul>
                </div>
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
        <Marker
          position={currentPosition}
          icon={customMarkers.currentLocation}
        />
        {hospitals.map((hospital) => (
          <Marker
            key={hospital.place_id}
            position={hospital.geometry.location}
            icon={customMarkers.hospital}
            onClick={() => setSelectedHospital(hospital)}
          />
        ))}
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