/**
 * AWS Bedrock設定の一元管理モジュール
 * 環境変数のアクセス、デフォルト値の設定、診断情報の提供を行います
 */

// 環境変数アクセス関数 - 複数の環境変数形式に対応
export function getEnvVar(name, defaultValue = '') {
  // VITE_プレフィックス付き/なし両方を試行
  const viteEnv = import.meta.env[`VITE_${name}`] || import.meta.env[name];
  const processEnv = typeof process !== 'undefined' && process.env ? 
    (process.env[`VITE_${name}`] || process.env[name]) : null;
  
  return viteEnv || processEnv || defaultValue;
}

// AWS設定の集約
export const AWS_CONFIG = {
  // リージョン設定
  region: getEnvVar('AWS_REGION', 'us-west-2'),
  
  // 認証情報
  credentials: {
    accessKeyId: getEnvVar('AWS_ACCESS_KEY_ID', ''),
    secretAccessKey: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
  },
  
  // モデル設定 - 環境変数で上書き可能
  claude: {
    modelId: getEnvVar('CLAUDE_MODEL', 'anthropic.claude-3-7-sonnet-20250219-v1:0'),
    version: getEnvVar('ANTHROPIC_VERSION', 'bedrock-2023-05-31'),
    maxTokens: parseInt(getEnvVar('CLAUDE_MAX_TOKENS', '1000'), 10),
    temperature: parseFloat(getEnvVar('CLAUDE_TEMPERATURE', '0.7')),
    topP: parseFloat(getEnvVar('CLAUDE_TOP_P', '0.999')),
    topK: parseInt(getEnvVar('CLAUDE_TOP_K', '250'), 10),
  }
};

// 設定診断機能
export function diagnoseConfig() {
  const configStatus = {
    region: {
      value: AWS_CONFIG.region,
      isValid: !!AWS_CONFIG.region
    },
    credentials: {
      accessKeyExists: !!AWS_CONFIG.credentials.accessKeyId,
      secretKeyExists: !!AWS_CONFIG.credentials.secretAccessKey,
      isValid: !!AWS_CONFIG.credentials.accessKeyId && !!AWS_CONFIG.credentials.secretAccessKey
    },
    model: {
      id: AWS_CONFIG.claude.modelId,
      version: AWS_CONFIG.claude.version,
      isValid: !!AWS_CONFIG.claude.modelId && !!AWS_CONFIG.claude.version
    },
    environment: {
      type: typeof window !== 'undefined' ? 'browser' : 'node',
      viteEnvExists: typeof import.meta !== 'undefined' && !!import.meta.env,
      processEnvExists: typeof process !== 'undefined' && !!process.env
    }
  };

  console.log('AWS Bedrock Configuration Diagnosis:', configStatus);
  return configStatus;
}

// APIエンドポイント構築
export function getBedrockEndpoint() {
  return `https://bedrock-runtime.${AWS_CONFIG.region}.amazonaws.com/model/${AWS_CONFIG.claude.modelId}/invoke`;
}
