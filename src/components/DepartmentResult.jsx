import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HospitalMap } from './HospitalMap';

export function DepartmentResult({ result, onReset }) {
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapError, setMapError] = useState(null);

  const getUrgencyColor = (level) => {
    const colors = {
      1: 'bg-green-50 text-green-700',
      2: 'bg-blue-50 text-blue-700',
      3: 'bg-yellow-50 text-yellow-700',
      4: 'bg-orange-50 text-orange-700',
      5: 'bg-red-50 text-red-700'
    };
    return colors[level] || colors[1];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">
          おすすめのびょういん
        </h2>
        
        <div className="bg-blue-50 rounded-xl p-6 mb-4">
          <div className="text-4xl mb-4">🏥</div>
          <div className="text-3xl font-bold text-blue-700 mb-2">
            {result.recommendedDepartment}
          </div>
          {result.alternativeDepartments?.length > 0 && (
            <div className="text-sm text-gray-600 mt-2">
              ほかにも こちらでも みてもらえます：
              <div className="font-medium text-blue-600 mt-1">
                {result.alternativeDepartments.join('・')}
              </div>
            </div>
          )}
        </div>

        {/* 病院マップ表示ボタン */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowMap(!showMap)}
          className="w-full px-4 py-3 bg-green-500 text-white rounded-lg mb-4 font-medium"
        >
          {showMap ? '地図を閉じる 🗺️' : '近くの病院を探す 🗺️'}
        </motion.button>

        {/* エラーメッセージ */}
        {mapError && (
          <div className="text-red-500 mb-4 text-sm">
            {mapError}
          </div>
        )}

        {/* 地図コンポーネント */}
        <AnimatePresence>
          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <HospitalMap
                department={result.recommendedDepartment}
                onError={setMapError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {result.urgencyLevel && (
          <div className={`rounded-xl p-4 mb-4 ${getUrgencyColor(result.urgencyLevel)}`}>
            <h3 className="font-bold mb-2">きゅうきゅうせい</h3>
            <div className="flex justify-center items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < result.urgencyLevel ? 'bg-current' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {result.recommendations?.length > 0 && (
          <div className="bg-green-50 rounded-xl p-6 text-left mb-4">
            <h3 className="font-bold text-green-700 mb-2">
              アドバイス
            </h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 詳細情報のトグルボタン */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDetailedInfo(!showDetailedInfo)}
          className="px-4 py-2 mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {showDetailedInfo ? '📝 くわしい説明をとじる' : '📝 くわしい説明をみる'}
        </motion.button>

        {/* 詳細情報 */}
        <AnimatePresence>
          {showDetailedInfo && result.reasoningNotes && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gray-50 rounded-xl p-6 text-left"
            >
              <h3 className="font-bold text-gray-700 mb-2">
                くわしい説明
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {result.reasoningNotes}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="bg-purple-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
          >
            もういちど えらびなおす 🔄
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}