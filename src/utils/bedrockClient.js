import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { AWS_CONFIG, diagnoseConfig, getEnvVar } from './bedrockConfig';

/**
 * AWS Bedrock Claude 3.7モデル呼び出しクライアント
 * 設定の一元管理と詳細な診断機能を提供
 */

// 環境診断関数
function debugEnvironmentVariables() {
  // 詳細な環境診断を実行
  const diagResults = diagnoseConfig();
  
  console.log('———————————— 環境診断 ————————————');
  console.log('Claudeモデル:', AWS_CONFIG.claude.modelId);
  console.log('AWSリージョン:', AWS_CONFIG.region);
  console.log('AWS認証情報あり:', diagResults.credentials.isValid);
  
  // 利用可能な環境変数の確認
  try {
    const envKeys = Object.keys(import.meta.env).filter(key => {
      // セキュリティ上重要な値は除外
      const lowKey = key.toLowerCase();
      return !lowKey.includes('key') && !lowKey.includes('secret') && !lowKey.includes('password');
    });
    console.log('利用可能な環境変数:', envKeys.join(', '));
  } catch (e) {
    console.log('環境変数一覧の取得に失敗しました');
  }
  
  console.log('———————————————————————————');
}

/**
 * Claude APIを呼び出して応答を取得
 * @param {string} prompt - Claudeへの入力プロンプト
 * @returns {Promise<string>} - Claude APIからの応答テキスト
 */
export async function invokeClaudeModel(prompt) {
  debugEnvironmentVariables();

  // Bedrock SDK用のクライアント初期化
  const client = new BedrockRuntimeClient({
    region: AWS_CONFIG.region,
    credentials: AWS_CONFIG.credentials
  });

  try {
    console.log('プロンプト送信準備中:', prompt ? `${prompt.substring(0, 50)}...` : 'プロンプトなし');

    // リクエスト構成
    const input = {
      modelId: AWS_CONFIG.claude.modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: AWS_CONFIG.claude.version,
        max_tokens: AWS_CONFIG.claude.maxTokens,
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }]
        }],
        temperature: AWS_CONFIG.claude.temperature,
        top_p: AWS_CONFIG.claude.topP,
        top_k: AWS_CONFIG.claude.topK
      })
    };

    console.log('AWS Bedrock APIリクエスト構成:', {
      modelId: AWS_CONFIG.claude.modelId,
      region: AWS_CONFIG.region,
      hasCredentials: !!AWS_CONFIG.credentials.accessKeyId && !!AWS_CONFIG.credentials.secretAccessKey
    });

    // API呼び出し実行
    const command = new InvokeModelCommand(input);
    console.log(`Bedrock API呼び出し開始: ${new Date().toISOString()}`);
    
    const response = await client.send(command);
    console.log(`Bedrock API応答受信: ${new Date().toISOString()}`);
    
    // レスポンス処理
    const responseBody = new TextDecoder().decode(response.body);
    console.log('レスポンスサイズ:', responseBody.length, 'バイト');
    
    try {
      const parsedResponse = JSON.parse(responseBody);
      
      // レスポンス構造の検証
      if (parsedResponse.content && parsedResponse.content[0] && parsedResponse.content[0].text) {
        console.log('正常なレスポンス構造を受信しました');
        return parsedResponse.content[0].text;
      } else {
        // 構造エラー詳細ログ
        console.error('予期しないレスポンス構造:', JSON.stringify({
          hasContent: !!parsedResponse.content,
          contentLength: parsedResponse.content ? parsedResponse.content.length : 0,
          firstElementType: parsedResponse.content && parsedResponse.content[0] ? typeof parsedResponse.content[0] : 'N/A',
          responseKeys: Object.keys(parsedResponse)
        }));
        throw new Error('Bedrock APIからの応答形式が不正です');
      }
    } catch (parseError) {
      console.error('レスポンスの解析に失敗:', parseError.message);
      throw new Error(`レスポンス解析エラー: ${parseError.message}`);
    }
  } catch (error) {
    // エラー詳細のログ記録
    console.error('Bedrock API呼び出しエラー:', {
      name: error.name,
      message: error.message,
      code: error.code || 'なし',
      stack: error.stack,
      requestId: error.$metadata ? error.$metadata.requestId : 'なし'
    });
    
    // 接続問題の詳細診断
    if (error.code === 'CredentialsProviderError') {
      console.error('AWS認証情報エラー: 環境変数を確認してください');
    } else if (error.code === 'UnrecognizedClientException') {
      console.error('AWS認証失敗: アクセスキーとシークレットキーを確認してください');
    } else if (error.code === 'ValidationException') {
      console.error('リクエスト検証エラー: モデルIDを確認してください:', AWS_CONFIG.claude.modelId);
    }
    
    // エラーを上位に伝播
    throw error;
  }
}