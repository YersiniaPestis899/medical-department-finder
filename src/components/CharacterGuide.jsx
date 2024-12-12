import React from 'react';
import { motion } from 'framer-motion';

export function CharacterGuide({ age, selectedSymptoms, recommendedDepartment }) {
  const getGuideMessage = () => {
    if (!age) {
      return {
        message: 'まずは なんさいか おしえてね！',
        emoji: '👋'
      };
    }

    if (!selectedSymptoms.length) {
      return {
        message: 'どこが わるいのかな？',
        emoji: '🤔'
      };
    }

    if (selectedSymptoms.length && !recommendedDepartment) {
      return {
        message: 'そうなんだね。ほかにも わるいところは ある？',
        emoji: '👨‍⚕️'
      };
    }

    return {
      message: 'だいじょうぶ！いっしょに おいしゃさんに いこうね！',
      emoji: '😊'
    };
  };

  const guide = getGuideMessage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-8"
    >
      <div className="text-4xl mb-2">{guide.emoji}</div>
      <p className="text-xl text-purple-600">{guide.message}</p>
    </motion.div>
  );
}