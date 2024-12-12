import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SymptomSelector } from './components/SymptomSelector';
import { AgeSelector } from './components/AgeSelector';
import { DepartmentResult } from './components/DepartmentResult';
import { CharacterGuide } from './components/CharacterGuide';
import { analyzeSymptomsWithClaude } from './utils/diagnosisService';
import { symptomsData } from './data/symptoms';

export default function App() {
  const [age, setAge] = useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [recommendedDepartment, setRecommendedDepartment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customSymptoms, setCustomSymptoms] = useState({});

  const handleAgeSelect = (selectedAge) => {
    setAge(selectedAge);
  };

  const handleSymptomSelect = (symptomKey, category, customSymptomData = null) => {
    console.log('Symptom selected:', { symptomKey, category, customSymptomData });
    
    if (customSymptomData) {
      // カスタム症状の新規追加
      setSelectedSymptoms(prev => [...prev, customSymptomData]);
      setCustomSymptoms(prev => ({
        ...prev,
        [symptomKey]: customSymptomData
      }));
    } else {
      // 既存の症状の追加/削除
      setSelectedSymptoms(prev => {
        const existingIndex = prev.findIndex(s => s.key === symptomKey);
        if (existingIndex >= 0) {
          // 症状の削除
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          // 症状の追加
          const symptom = category === 'custom'
            ? customSymptoms[symptomKey]
            : { ...symptomsData[category][symptomKey], key: symptomKey, category };
          return [...prev, symptom];
        }
      });
    }
  };

  const handleAnalyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeSymptomsWithClaude(selectedSymptoms, age);
      setRecommendedDepartment(result);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      setRecommendedDepartment({
        recommendedDepartment: '小児科',
        alternativeDepartments: [],
        urgencyLevel: 2,
        recommendations: ['お近くの病院を受診してください'],
        warningSigns: ['症状が急に悪くなったとき'],
        preventiveMeasures: ['ゆっくり休んでください']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setAge(null);
    setSelectedSymptoms([]);
    setRecommendedDepartment(null);
    setCustomSymptoms({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            びょういんナビ
          </h1>
          <p className="text-lg text-purple-600">
            どこがわるいのかおしえてね
          </p>
        </div>

        <CharacterGuide 
          age={age}
          selectedSymptoms={selectedSymptoms}
          recommendedDepartment={recommendedDepartment}
        />

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          {!age && (
            <AgeSelector onAgeSelect={handleAgeSelect} />
          )}
          
          {age && !recommendedDepartment && (
            <SymptomSelector 
              onSymptomSelect={handleSymptomSelect}
              selectedSymptoms={selectedSymptoms}
              customSymptoms={customSymptoms}
            />
          )}

          {recommendedDepartment && (
            <DepartmentResult 
              result={recommendedDepartment}
              onReset={handleReset}
            />
          )}
        </div>

        {age && selectedSymptoms.length > 0 && !recommendedDepartment && (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`bg-green-500 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg ${
                isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleAnalyzeSymptoms}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🏥</span>
                  かんがえちゅう...
                </span>
              ) : (
                'びょういんをさがす 🏥'
              )}
            </motion.button>
          </div>
        )}

        {age && selectedSymptoms.length > 0 && (
          <div className="text-center mt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="text-purple-600 underline"
            >
              さいしょからえらびなおす
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}