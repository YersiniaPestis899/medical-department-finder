/**
 * AWS Bedrock APIを直接fetchで呼び出す代替実装
 * AWS SDK for JavaScriptの問題をトラブルシューティングするための実装です
 */

// モデルIDを環境変数から取得
const DEFAULT_CLAUDE_MODEL = 'anthropic.claude-3-5-sonnet-20241022-v2:0';
const CLAUDE_MODEL = import.meta.env.VITE_CLAUDE_MODEL || import.meta.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL;

/**
 * AWS Bedrock APIを直接fetch APIで呼び出す
 * 注意: 完全なAWS SigV4署名は実装していません
 */
export async function invokeBedrockModelWithFetch(prompt) {
  try {
    // 環境変数からの設定取得
    const modelId = CLAUDE_MODEL;
    const region = import.meta.env.VITE_AWS_REGION || import.meta.env.AWS_REGION || 'us-west-2';
    const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || import.meta.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || import.meta.env.AWS_SECRET_ACCESS_KEY;
    
    console.log(`🔄 Fetch実装でモデル${modelId}を呼び出します...`);
    
    if (!accessKeyId || !secretAccessKey) {
      console.error('⚠️ AWS認証情報が設定されていません');
      throw new Error('AWS認証情報が不足しています');
    }
    
    // APIエンドポイント
    const endpoint = `https://bedrock-runtime.${region}.amazonaws.com/model/${modelId}/invoke`;
    
    // リクエストボディ
    const requestBody = JSON.stringify({
      "anthropic_version": "bedrock-2023-05-31",
      "max_tokens": 1000,
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
    
    // 日時フォーマット (AWS SigV4署名用)
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    
    // 単純なリクエスト (テスト用)
    // 注意: 実際の認証には完全なAWS SigV4署名が必要です
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Amz-Date': amzDate
    };
    
    // 暫定的な署名 (完全ではありません)
    headers['Authorization'] = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${dateStamp}/${region}/bedrock/aws4_request`;
    
    console.log(`📤 リクエスト送信先: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: requestBody
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API呼び出しエラー (${response.status}):`, errorText);
      throw new Error(`APIリクエストが失敗しました: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ レスポンス受信');
    
    // レスポンス構造の検証
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('❌ 予期しないレスポンス構造:', data);
      throw new Error('無効なレスポンス構造');
    }
    
    return data.content[0].text;
  } catch (error) {
    console.error('❌ Fetch実装でエラーが発生しました:', error);
    throw error;
  }
}