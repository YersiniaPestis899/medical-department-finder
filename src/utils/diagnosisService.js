import { invokeClaudeModel } from './bedrockClient';

export async function analyzeSymptomsWithClaude(symptoms, ageData) {
  console.log('Analyzing symptoms with age data:', ageData);
  
  const normalizedSymptoms = symptoms.map(s => ({
    name: s.name,
    description: s.description || '',
    severity: s.severity || '3',
    duration: s.duration || ''
  }));

  // 年齢情報の文字列生成
  const getAgeDescription = (ageData) => {
    if (ageData.exactAge) {
      return `${ageData.age}歳`;
    } else {
      return `${ageData.ageRange}の${ageData.label}`;
    }
  };

  // 年齢層に応じた診療科選択ガイダンス
  const getAgeGuidance = (ageData) => {
    if (ageData.exactAge) {
      if (ageData.age <= 15) return '小児科での診療も検討可能です。';
      if (ageData.age >= 65) return '高齢者特有の症状にも注意が必要です。';
      return '成人の専門診療科での診療が適切です。';
    } else {
      if (ageData.max <= 15) return '小児科での診療を中心に検討します。';
      if (ageData.min >= 65) return '高齢者特有の症状に配慮が必要です。';
      if (ageData.min >= 16) return '成人の専門診療科を中心に検討します。';
      return '年齢層に応じた適切な診療科を検討します。';
    }
  };

  const prompt = `
あなたは総合診療医として、患者の症状から最適な診療科を提案してください。

[患者基本情報]
===============
• 患者: ${getAgeDescription(ageData)}
• ${getAgeGuidance(ageData)}
• 主訴: ${normalizedSymptoms.map(s => s.name).join('、')}

[詳細な症状情報]
===============
${normalizedSymptoms.map((s, i) => `
症状${i + 1}: ${s.name}
${s.description ? `状態: ${s.description}` : ''}
${s.duration ? `期間: ${s.duration}` : ''}
${s.severity ? `強さ: ${s.severity}/5` : ''}
`).join('\n')}

[診療科選択の注意事項]
===============
• この年齢層（${getAgeDescription(ageData)}）に最適な診療科を選択してください
• ${getAgeGuidance(ageData)}
• 症状の組み合わせを考慮して、最適な診療科を選択してください
• 必要に応じて複数の診療科を提案してください

[成人の専門診療科の例]
===============
• 内科系: 消化器内科、循環器内科、呼吸器内科、神経内科、血液内科、腎臓内科、内分泌代謝内科など
• 外科系: 消化器外科、心臓血管外科、呼吸器外科、脳神経外科など
• その他: 耳鼻咽喉科、眼科、皮膚科、整形外科、精神科、救急科など

[回答形式]
===============
以下の形式でJSONで回答してください:
{
  "recommendedDepartment": "最適な診療科",
  "alternativeDepartments": ["その他の検討可能な診療科"],
  "urgencyLevel": "緊急性（1-5）",
  "recommendations": ["受診までの注意点"],
  "warningSigns": ["この症状が出たらすぐ受診"],
  "preventiveMeasures": ["気をつけること"],
  "reasoningNotes": "診療科選択の理由"
}`;

  try {
    console.log('Sending prompt to Bedrock:', prompt);
    const response = await invokeClaudeModel(prompt);
    const result = JSON.parse(response);
    console.log('Diagnosis result:', result);
    return result;
  } catch (error) {
    console.error('Error in diagnosis service:', error);
    throw error;
  }
}