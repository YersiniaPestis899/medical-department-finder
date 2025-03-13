import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const CLAUDE_MODEL = 'anthropic.claude-3-7-sonnet-20250219-v1:0';

function debugEnvironmentVariables() {
  // Vite環境変数とVercel環境変数の両方をチェック
  console.log('Environment Variables Debug:', {
    REGION: import.meta.env.VITE_AWS_REGION || import.meta.env.AWS_REGION,
    ACCESS_KEY_EXISTS: !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID || import.meta.env.AWS_ACCESS_KEY_ID),
    SECRET_KEY_EXISTS: !!(import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || import.meta.env.AWS_SECRET_ACCESS_KEY),
    ENVIRONMENT: import.meta.env.MODE || process.env.NODE_ENV || 'unknown',
    VERCEL_ENV: import.meta.env.VERCEL_ENV || process.env.VERCEL_ENV || 'not-vercel'
  });
}

export async function invokeClaudeModel(prompt) {
  debugEnvironmentVariables();

  // Vercel環境とローカル環境の両方に対応
  const region = import.meta.env.VITE_AWS_REGION || import.meta.env.AWS_REGION || 'us-west-2';
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID || import.meta.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || import.meta.env.AWS_SECRET_ACCESS_KEY;
  
  console.log('Using AWS Region:', region);
  console.log('AWS Credentials Available:', !!accessKeyId && !!secretAccessKey);
  
  if (!accessKeyId || !secretAccessKey) {
    console.error('AWS credentials are missing. Check Vercel environment variables.');
  }

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    console.log('Sending prompt to Bedrock:', prompt);

    const input = {
      modelId: CLAUDE_MODEL,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: [{
            type: "text",
            text: prompt
          }]
        }],
        temperature: 0.7,
        top_p: 0.999,
      })
    };

    const command = new InvokeModelCommand(input);
    console.log('Sending request to AWS Bedrock with model:', CLAUDE_MODEL);
    const response = await client.send(command);

    const responseBody = new TextDecoder().decode(response.body);
    console.log('Response received from Bedrock');
    // セキュリティ上の理由からレスポンス全体をログに出力しない
    console.log('Response length:', responseBody.length);
    
    try {
      const parsedResponse = JSON.parse(responseBody);
      if (parsedResponse.content && parsedResponse.content[0] && parsedResponse.content[0].text) {
        return parsedResponse.content[0].text;
      } else {
        console.error('Unexpected response structure:', JSON.stringify(parsedResponse, null, 2));
        throw new Error('Invalid response structure from Bedrock');
      }
    } catch (parseError) {
      console.error('Failed to parse Bedrock response:', parseError);
      throw new Error(`Response parsing failed: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Detailed Bedrock API error:', error);
    throw error;
  }
}