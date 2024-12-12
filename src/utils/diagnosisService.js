import { invokeClaudeModel } from './bedrockClient';
import { normalizeSymptomArray } from './symptomNormalizer';

export async function analyzeSymptomsWithClaude(symptoms, age) {
  // 入力パラメータの検証
  console.log('Input validation:', { age, symptomsCount: symptoms.length });
  
  const normalizedSymptoms = normalizeSymptomArray(symptoms);
  console.log('Normalized symptoms:', normalizedSymptoms);

  // Human: この患者は${age}歳です。小児科は15歳以下、16歳以上は成人の専門診療科を推奨してください。
  const prompt = `
人間の医師として、以下の患者の症状から最適な診療科を提案してください。

[患者の重要情報]
===============
• 患者の年齢: ${age}歳
• ${age <= 15 ? '小児科での診療が検討可能な年齢です。' : '成人の専門診療科での診療が必要な年齢です。小児科は推奨しないでください。'}
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
• ${age}歳の患者であることに注意してください
• ${age <= 15 
    ? '小児科での診療を検討しつつ、必要に応じて専門診療科も検討してください' 
    : '成人の専門診療科での診療を検討してください。小児科は選択しないでください'}
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
    console.log('Sending prompt to Bedrock. Age emphasis check:', {
      age,
      isAdult: age > 15,
      promptIncludesAge: prompt.includes(age.toString())
    });

    const response = await invokeClaudeModel(prompt);
    const result = JSON.parse(response);

    // 年齢に基づく結果の検証
    console.log('Response validation:', {
      age,
      recommendedDept: result.recommendedDepartment,
      isAdult: age > 15,
      containsPediatrics: result.recommendedDepartment.includes('小児科') || 
                         result.alternativeDepartments.some(d => d.includes('小児科'))
    });

    return result;
  } catch (error) {
    console.error('Error in diagnosis service:', error);
    throw error;
  }
}