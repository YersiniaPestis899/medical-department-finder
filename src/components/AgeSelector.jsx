import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function AgeSelector({ onAgeSelect }) {
  const [showDetailedAge, setShowDetailedAge] = useState(false);
  const [customAge, setCustomAge] = useState('');

  const ageGroups = [
    { min: 0, max: 2, label: 'あかちゃん', icon: '👶', ageRange: '0-2歳' },
    { min: 3, max: 6, label: 'ようちえん', icon: '🎨', ageRange: '3-6歳' },
    { min: 7, max: 12, label: 'しょうがっこう', icon: '🏫', ageRange: '7-12歳' },
    { min: 13, max: 15, label: 'ちゅうがっこう', icon: '📚', ageRange: '13-15歳' },
    { min: 16, max: 18, label: 'こうこうせい', icon: '🎒', ageRange: '16-18歳' },
    { min: 19, max: 64, label: 'おとな', icon: '👤', ageRange: '19-64歳' },
    { min: 65, max: 120, label: 'こうれいしゃ', icon: '👴', ageRange: '65歳以上' }
  ];

  const handleCustomAgeSubmit = (e) => {
    e.preventDefault();
    const age = parseInt(customAge);
    if (age && age > 0 && age <= 120) {
      const ageGroupData = {
        type: 'specific',
        age: age,
        exactAge: true
      };
      onAgeSelect(ageGroupData);
    }
  };

  const handleAgeGroupSelect = (group) => {
    const ageGroupData = {
      type: 'range',
      min: group.min,
      max: group.max,
      label: group.label,
      ageRange: group.ageRange,
      exactAge: false
    };
    onAgeSelect(ageGroupData);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-600">
        なんさい？
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {ageGroups.map((group) => (
          <motion.button
            key={group.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            onClick={() => handleAgeGroupSelect(group)}
          >
            <div className="text-4xl mb-2">{group.icon}</div>
            <div className="text-lg font-medium text-gray-700">{group.label}</div>
            <div className="text-sm text-gray-500">{group.ageRange}</div>
          </motion.button>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={() => setShowDetailedAge(!showDetailedAge)}
          className="text-purple-600 underline text-sm"
        >
          {showDetailedAge ? 'グループで選ぶ' : 'ちょうど何歳か入力する'}
        </button>

        {showDetailedAge && (
          <form onSubmit={handleCustomAgeSubmit} className="mt-4">
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                min="0"
                max="120"
                value={customAge}
                onChange={(e) => setCustomAge(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-24 text-center"
                placeholder="年齢"
              />
              <span className="text-gray-700">歳</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-purple-500 text-white px-4 py-2 rounded-lg"
              >
                決定
              </motion.button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}