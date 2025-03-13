import { invokeClaudeModel } from './bedrockClient';
import { AWS_CONFIG, diagnoseConfig } from './bedrockConfig';

/**
 * メディカル診断システム - 症状分析モジュール
 * 症状と年齢から最適な診療科を推定
 */

// 症状分析関数
export async function analyzeSymptomsWithBedrock(symptoms, age) {
  const ageGroup = getAgeGroup(age);
  
  // リクエスト前の診断実行
  console.log('症状分析開始:', {
    症状数: symptoms.length,
    年齢: age,
    年齢層: ageGroup.description,
    設定状態: diagnoseConfig()
  });
  
  // プロンプト構築
  const prompt = `あなたは${ageGroup.type}の専門医です。以下の症状を持つ${age}歳の患者さんに対して、推奨される診療科と注意点を教えてください。

症状:
${symptoms.map(s => `- ${s.name}`).join('\n')}

追加の情報:
${symptoms.map(s => s.additionalInfo || '').filter(Boolean).join('\n')}

患者の年齢: ${age}歳 (${ageGroup.description})

以下の形式でJSON形式で回答してください:
{
  "recommendedDepartment": "最も推奨される診療科",
  "alternativeDepartments": ["その他の検討可能な診療科"],
  "urgencyLevel": "緊急性の度合い（1-5、5が最も緊急）",
  "recommendations": ["具体的な注意点や推奨事項"],
  "warningSigns": ["この症状があれば要注意という事項"],
  "preliminaryDiagnosis": "予想される病態や疾患の可能性",
  "preventiveMeasures": ["予防的なアドバイス"],
  "additionalNotes": "年齢層特有の注意点"
}`;

  try {
    // トレーシングログ
    console.log('Claude解析リクエスト開始');
    
    // Claudeモデル呼び出し
    const response = await invokeClaudeModel(prompt);
    console.log('Claude解析レスポンス受信', {
      responseLength: response ? response.length : 0,
      isJSONFormat: response && response.trim().startsWith('{') && response.trim().endsWith('}')
    });
    
    // JSON構文解析
    try {
      const parsedResponse = JSON.parse(response);
      
      // 必須フィールド検証
      validateDiagnosisResponse(parsedResponse);
      
      return parsedResponse;
    } catch (jsonError) {
      console.error('JSONパース失敗:', jsonError.message);
      console.error('有効でないJSON応答:', response.substring(0, 100) + '...');
      throw new Error(`診断結果のJSONパースに失敗: ${jsonError.message}`);
    }
  } catch (error) {
    console.error('Bedrock API診断エラー:', error);
    
    // 堅牢なフォールバック処理
    const fallbackResponse = generateFallbackDiagnosis(symptoms, ageGroup);
    console.log('フォールバック診断を生成しました:', fallbackResponse);
    
    return fallbackResponse;
  }
}

// 診断結果の検証
function validateDiagnosisResponse(response) {
  const requiredFields = [
    'recommendedDepartment',
    'alternativeDepartments',
    'urgencyLevel',
    'recommendations'
  ];
  
  const missingFields = requiredFields.filter(field => !response[field]);
  
  if (missingFields.length > 0) {
    console.warn('診断結果に不足フィールドあり:', missingFields.join(', '));
  }
}

// フォールバック診断生成
function generateFallbackDiagnosis(symptoms, ageGroup) {
  // 症状からデフォルト診療科を推定
  const defaultDepartment = symptoms[0] && symptoms[0].departments ? 
    symptoms[0].departments[0] : '一般内科';
  
  const altDepartments = symptoms[0] && symptoms[0].departments ? 
    symptoms[0].departments.slice(1) : ['内科', '総合診療科'];
  
  return {
    recommendedDepartment: defaultDepartment,
    alternativeDepartments: altDepartments,
    urgencyLevel: 2,
    recommendations: [
      'できるだけ早めに医療機関を受診してください。',
      '症状が急激に悪化した場合は、救急外来を受診してください。'
    ],
    warningSigns: ['症状が急激に悪化', '普段と様子が大きく異なる'],
    preliminaryDiagnosis: '詳細な診断には医師の診察が必要です',
    preventiveMeasures: ['十分な休息を取る', '水分を適切に取る'],
    additionalNotes: ageGroup.defaultNote
  };
}

// 年齢グループ分類関数
function getAgeGroup(age) {
  if (age <= 2) {
    return {
      type: '小児科医',
      description: '乳児期',
      defaultNote: '乳児期特有の注意が必要です'
    };
  } else if (age <= 6) {
    return {
      type: '小児科医',
      description: '幼児期',
      defaultNote: '幼児期特有の注意が必要です'
    };
  } else if (age <= 12) {
    return {
      type: '小児科医',
      description: '学童期',
      defaultNote: '学童期特有の注意が必要です'
    };
  } else if (age <= 15) {
    return {
      type: '小児科医・思春期専門医',
      description: '思春期前期',
      defaultNote: '思春期特有の注意が必要です'
    };
  } else if (age <= 18) {
    return {
      type: '小児科医・思春期専門医',
      description: '思春期後期',
      defaultNote: '思春期特有の注意が必要です'
    };
  } else if (age <= 64) {
    return {
      type: '一般内科医',
      description: '成人期',
      defaultNote: '年齢に応じた健康管理が重要です'
    };
  } else {
    return {
      type: '老年内科医',
      description: '高齢期',
      defaultNote: '高齢者特有の注意が必要です'
    };
  }
}