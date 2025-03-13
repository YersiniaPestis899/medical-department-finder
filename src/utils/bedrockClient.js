import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const CLAUDE_MODEL = 'anthropic.claude-3-5-sonnet-20241022-v2:0';

function debugEnvironmentVariables() {
  console.log('Environment Variables Debug:', {
    REGION: import.meta.env.AWS_REGION,
    ACCESS_KEY_EXISTS: !!import.meta.env.AWS_ACCESS_KEY_ID,
    SECRET_KEY_EXISTS: !!import.meta.env.AWS_SECRET_ACCESS_KEY,
    ALL_ENV: import.meta.env
  });
}

export async function invokeClaudeModel(prompt) {
  debugEnvironmentVariables();

  const region = import.meta.env.AWS_REGION || 'us-west-2';
  console.log('Using AWS Region:', region);

  const client = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
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
    const response = await client.send(command);

    const responseBody = new TextDecoder().decode(response.body);
    console.log('Raw response from Bedrock:', responseBody);
    
    const parsedResponse = JSON.parse(responseBody);
    return parsedResponse.content[0].text;
  } catch (error) {
    console.error('Detailed Bedrock API error:', error);
    throw error;
  }
}