/**
 * 症状データを正規化するユーティリティ
 */
export function normalizeSymptom(symptom) {
  // 基本構造の抽出
  const normalized = {
    name: symptom.name,
    description: symptom.description || '',
    severity: symptom.severity || '3',
    duration: symptom.duration || ''
  };

  // 追加情報がある場合は補足説明として追加
  if (symptom.additionalSymptoms?.length > 0) {
    normalized.description = `${normalized.description} (関連症状: ${symptom.additionalSymptoms.join(', ')})`.trim();
  }

  // 重要: 診療科情報は除外
  // departmentsプロパティは意図的に除外し、Claude 3.5 Sonnetに判断を委ねる

  return normalized;
}

export function normalizeSymptomArray(symptoms) {
  return symptoms.map(normalizeSymptom);
}