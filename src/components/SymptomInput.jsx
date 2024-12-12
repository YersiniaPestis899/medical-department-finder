import React, { useState } from 'react';

export function SymptomInput({ onSubmit }) {
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  const commonSymptoms = [
    '頭痛', '腹痛', '発熱', '咳', '関節痛',
    '目の痛み', '歯痛', 'めまい', '皮膚のかゆみ', '胸痛'
  ];

  const handleSymptomClick = (symptom) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleRemoveSymptom = (symptomToRemove) => {
    setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptomToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(selectedSymptoms);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">よくある症状</h2>
        <div className="flex flex-wrap gap-2">
          {commonSymptoms.map((symptom) => (
            <button
              key={symptom}
              onClick={() => handleSymptomClick(symptom)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>

      {selectedSymptoms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">選択された症状:</h3>
          <div className="flex flex-wrap gap-2">
            {selectedSymptoms.map((symptom) => (
              <div
                key={symptom}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full"
              >
                {symptom}
                <button
                  onClick={() => handleRemoveSymptom(symptom)}
                  className="ml-1 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedSymptoms.length === 0}
        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        診療科を診断する
      </button>
    </div>
  );
}