const AWS_ACCESS_KEY_ID = import.meta.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = import.meta.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = import.meta.env.AWS_REGION;

// AWS Bedrock APIのエンドポイント構築
const BEDROCK_ENDPOINT = `https://bedrock-runtime.${AWS_REGION}.amazonaws.com/model/anthropic.claude-3-5-sonnet-20241022-v2:0/invoke`;

export async function analyzeSymptomsWithBedrock(symptoms, age) {
  const ageGroup = getAgeGroup(age);
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
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
      throw new Error('AWS credentials not configured');
    }

    // AWS署名バージョン4の生成
    const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const date = datetime.substr(0, 8);

    // リクエストボディの準備
    const requestBody = JSON.stringify({
      "anthropic_version": "bedrock-2023-05-31",
      "max_tokens": 1000,
      "top_k": 250,
      "stop_sequences": [],
      "temperature": 0.7,
      "top_p": 0.999,
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": prompt
            }
          ]
        }
      ]
    });

    const response = await fetch(BEDROCK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Amz-Date': datetime,
        'Authorization': await generateAWSSignature(
          'POST',
          BEDROCK_ENDPOINT,
          requestBody,
          datetime,
          date
        ),
      },
      body: requestBody
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return JSON.parse(data.content[0].text);
  } catch (error) {
    console.error('Bedrock API error:', error);
    // フォールバック処理
    return {
      recommendedDepartment: symptoms[0].departments[0],
      alternativeDepartments: symptoms[0].departments.slice(1),
      urgencyLevel: 2,
      recommendations: [
        'できるだけ早めに医療機関を受診してください。',
        '症状が急激に悪化した場合は、救急外来を受診してください。'
      ],
      warningSigns: ['症状が急激に悪化', '普段と様子が大きく異なる'],
      preventiveMeasures: ['十分な休息を取る', '水分を適切に取る'],
      additionalNotes: getAgeGroup(age).defaultNote
    };
  }
}

// AWS署名バージョン4の生成関数
async function generateAWSSignature(method, url, body, datetime, date) {
  // AWS Signature V4の実装
  // 注: 実際の実装ではAWS SDKを使用することを推奨
  const region = AWS_REGION;
  const service = 'bedrock';
  
  // 署名の実装は複雑なため、AWS SDKまたは専用のライブラリの使用を推奨
  // ここでは簡略化された例を示しています
  return `AWS4-HMAC-SHA256 Credential=${AWS_ACCESS_KEY_ID}/${date}/${region}/${service}/aws4_request`;
}

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