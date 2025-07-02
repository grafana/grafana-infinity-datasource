import { llm } from '@grafana/llm';

export async function getLLMSuggestion(JSON_DATA: any, prompt: string): Promise<any> {
  try {
    const enabled = await llm.enabled();
    if (!enabled) {
      throw new Error('LLM service is not configured or enabled');
    }
    if (!prompt) {
      return '.';
    }
    let messages: llm.Message[] = [
      {
        role: 'system',
        content: 'You are an experienced, competent SRE with knowledge of understanding complex JSON structures and highly experienced in JQ query language when parsing JSON.',
      },
      {
        role: 'system',
        content: 'You are also highly skilled in parsing complex JSON data and provide various insights from the JSON using JQ query language',
      },
      {
        role: 'system',
        content: `You have the following JSON data ${JSON.stringify(JSON_DATA)}`,
      },
      {
        role: 'user',
        content: `Can you generate the JQ query for the following question using the above JSON data. Just return the JQ query alone in string format and not in markdown format. Question: "${prompt}"`,
      },
    ];
    const response = await llm.chatCompletions({ model: llm.Model.BASE, messages });
    let result = (response.choices[0]?.message?.content || '{}').replaceAll('```jq', '').replaceAll('```', '').replaceAll('\n', '');
    if (result.startsWith("'") && result.endsWith("'")) {
      result = result.substring(1);
      result = result.substring(0, result.length - 1);
    }
    return result || '.';
  } catch (error: any) {
    console.error('Failed to get LLM response:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}

export async function getLLMSuggestions(JSON_DATA: any, prompt?: string): Promise<string> {
  try {
    const enabled = await llm.enabled();
    if (!enabled) {
      throw new Error('LLM service is not configured or enabled');
    }
    let messages: llm.Message[] = [
      {
        role: 'system',
        content: 'You are an experienced, competent SRE with knowledge of understanding complex JSON structures and highly experienced in JQ query language when parsing JSON.',
      },
      {
        role: 'system',
        content: 'You are also highly skilled in parsing complex JSON data and provide various insights from the JSON using JQ query language',
      },
      {
        role: 'system',
        content: `You have the following JSON data ${JSON.stringify(JSON_DATA)}`,
      },
      {
        role: 'user',
        content: 'Can you give insights of the above JSON data using JQ query language. List all the insights and their corresponding JQ query in JSON format. Just return the JSON',
      },
    ];
    const response = await llm.chatCompletions({ model: llm.Model.BASE, messages });
    let result = JSON.parse((response.choices[0]?.message?.content || '{}').replaceAll('```json', '').replaceAll('```', ''));
    return result || { message: 'No response received' };
  } catch (error: any) {
    console.error('Failed to get LLM response:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}
