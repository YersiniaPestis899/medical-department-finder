import React, { useState } from 'react';
import { motion } from 'framer-motion';

export function CustomSymptomInput({ onSymptomAdd }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSymptom, setCustomSymptom] = useState({
    name: '',
    description: '',
    duration: '',
    severity: '1',
  });

  const severityDescriptions = [
    'すこしだけつらい',
    'ちょっとつらい',
    'つらい',
    'とてもつらい',
    'がまんできないくらいつらい'
  ];

  const severityEmojis = ['😊', '🙂', '😐', '😟', '😣'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (customSymptom.name.trim()) {
      const symptomToAdd = {
        ...customSymptom,
        id: `custom-${Date.now()}`,
        key: `custom-${Date.now()}`,
        icon: '📝',
        kidsFriendlyName: customSymptom.name,
        departments: ['内科'], // デフォルト値
        isCustom: true,
        category: 'custom'
      };
      
      onSymptomAdd(symptomToAdd);
      
      setCustomSymptom({
        name: '',
        description: '',
        duration: '',
        severity: '1',
      });
      setIsOpen(false);
    }
  };

  return (
    <div className="mt-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
      >
        {isOpen ? 'とじる ↑' : 'しょうじょうをくわしくかく ✏️'}
      </motion.button>

      {isOpen && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 space-y-4"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              どんなふうにわるいの？
            </label>
            <input
              type="text"
              value={customSymptom.name}
              onChange={(e) => setCustomSymptom({ ...customSymptom, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="たとえば：あたまがいたい"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              もうすこしくわしくおしえてね
            </label>
            <textarea
              value={customSymptom.description}
              onChange={(e) => setCustomSymptom({ ...customSymptom, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="たとえば：うごくとあたまがいたくなる"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              いつからこうなの？
            </label>
            <input
              type="text"
              value={customSymptom.duration}
              onChange={(e) => setCustomSymptom({ ...customSymptom, duration: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="たとえば：きのうのよるから"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              どのくらいつらい？
            </label>
            <div className="grid grid-cols-5 gap-2">
              {severityEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCustomSymptom({ ...customSymptom, severity: String(index + 1) })}
                  className={`p-2 rounded-lg flex flex-col items-center justify-center ${
                    customSymptom.severity === String(index + 1)
                      ? 'bg-purple-100 border-2 border-purple-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  } transition-colors`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className="text-xs text-gray-600">
                    {severityDescriptions[index]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            かんせい！
          </motion.button>
        </motion.form>
      )}
    </div>
  );
}