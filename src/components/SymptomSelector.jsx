import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { symptomsData } from '../data/symptoms';
import { CustomSymptomInput } from './CustomSymptomInput';

export function SymptomSelector({ onSymptomSelect, selectedSymptoms, customSymptoms = {} }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const categoryTitles = {
    all: 'すべて',
    general: 'からだぜんたい',
    respiratory: 'いきとせき',
    digestive: 'おなか',
    skin: 'はだ',
    eyes: 'め',
    ears: 'みみ',
    mouth: 'くち',
    mental: 'こころ',
    emergency: 'きんきゅう',
    custom: 'じぶんでかいた'
  };

  const handleCustomSymptomAdd = (customSymptom) => {
    onSymptomSelect(customSymptom.id, 'custom', customSymptom);
  };

  const filterSymptoms = () => {
    let filteredSymptoms = {};
    
    // 通常の症状のフィルタリング
    Object.entries(symptomsData).forEach(([category, symptoms]) => {
      if (activeCategory === 'all' || activeCategory === category) {
        const filtered = Object.entries(symptoms).filter(([key, symptom]) => {
          const searchString = `${symptom.name} ${symptom.kidsFriendlyName}`;
          return searchString.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        if (filtered.length > 0) {
          filteredSymptoms[category] = Object.fromEntries(filtered);
        }
      }
    });

    // カスタム症状の追加
    if ((activeCategory === 'all' || activeCategory === 'custom') && Object.keys(customSymptoms).length > 0) {
      filteredSymptoms.custom = customSymptoms;
    }
    
    return filteredSymptoms;
  };

  return (
    <div className="w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-purple-600">
        どこがわるいのかな？
      </h2>

      {/* 検索バー - モバイル最適化 */}
      <div className="mb-4 sm:mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 sm:py-2 text-lg sm:text-base border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="しょうじょうをさがす..."
        />
      </div>

      {/* カテゴリタブ - モバイル最適化 */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {Object.entries(categoryTitles).map(([category, title]) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full min-h-[44px] ${
              activeCategory === category
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } transition-colors text-sm sm:text-base`}
          >
            {title}
          </motion.button>
        ))}
      </div>

      {/* 症状グリッド - モバイル最適化 */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4 sm:space-y-8"
      >
        {Object.entries(filterSymptoms()).map(([category, symptoms]) => (
          <div key={category} className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-600">
              {categoryTitles[category]}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(symptoms).map(([key, symptom]) => (
                <motion.button
                  key={key}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-3 sm:p-4 rounded-xl text-center transition-colors min-h-[80px] flex flex-col items-center justify-center ${
                    selectedSymptoms.some(s => s.key === key)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  } shadow-sm`}
                  onClick={() => onSymptomSelect(key, category)}
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{symptom.icon}</div>
                  <div className="text-sm sm:text-base font-medium leading-tight">
                    {symptom.kidsFriendlyName}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* カスタム症状入力 - モバイル最適化 */}
      <CustomSymptomInput onSymptomAdd={handleCustomSymptomAdd} />
    </div>
  );
}