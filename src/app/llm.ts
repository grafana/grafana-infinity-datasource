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

export async function getLLMSuggestions(JSON_DATA: any): Promise<Array<{ insight: string; jq_query: string }>> {
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
        role: 'system',
        content: `If the JSON data is of array type, then use the JSON as it is. If the JSON data is of object type, parse the JSON and find the array of object that contain valid results. If no array objects present in the JSON, consider JSON as key value pair`,
      },
      {
        role: 'user',
        content:
          'Can you give insights of the above JSON data using JQ query language. List all the insights and their corresponding JQ query in JSON format. Just return the JSON in JSON format and no markdown',
      },
    ];
    const response = await llm.chatCompletions({ model: llm.Model.BASE, messages });
    return JSON.parse(response.choices[0].message?.content || '{}').insights;
  } catch (error: any) {
    console.error('Failed to get LLM response:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}
