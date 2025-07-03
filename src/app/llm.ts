import { InfinityColumnFormat } from '@/types';
import { llm } from '@grafana/llm';

export type LLMSuggestionsOutput = {
  insight: string;
  jq_query: string;
  description: string;
  fields?: Array<{
    selector: string;
    display_name: string;
    type: InfinityColumnFormat;
  }>;
};
export async function getLLMSuggestion(JSON_DATA: any, prompt: string): Promise<LLMSuggestionsOutput[]> {
  try {
    const enabled = await llm.enabled();
    if (!enabled) {
      throw new Error('LLM service is not configured or enabled');
    }
    if (!prompt) {
      return [{ insight: '', jq_query: '.', description: '' }];
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
        content: `If the JSON data includes any time field or looks like timeseries, add insights in timeseries format`,
      },
      {
        role: 'user',
        content: `Can you generate the JQ query for the following question using the above JSON data. Just return only the JQ query in plain text format and output shouldn't be in markdown format. Don't include any prefix / suffix to the JQ query. Also don't wrap the output with quotes. Question: "${prompt}"`,
      },
      {
        role: 'user',
        content: [
          `Can you generate the insights for the following query. Query: "${prompt}"`,
          'Just return the JSON in JSON format and no markdown.',
          'List only one insight in array format',
          'Output JSON should be array of objects with keys "insight", "description", "jq_query" and "fields"',
          'fields column should be array of field names, user friendly name and their types. Field type should be one of string, number, timestamp, timestamp_epoch, timestamp_epoch_s or boolean. The keys of field should be "selector", "display_name" and "type". "selector" field name should come from JQ output JSON.',
          'If the value of the field with string format looks like date or time field, mark its field type as timestamp',
          'If the value of the field with number format looks like epoch milli seconds timestamp, mark its field type as timestamp_epoch',
          'If the value of the field with number format looks like epoch seconds timestamp, mark its field type as timestamp_epoch_s',
        ].join(' '),
      },
    ];
    const response = await llm.chatCompletions({ model: llm.Model.BASE, messages });
    return JSON.parse(response.choices[0].message?.content || '[]');
  } catch (error: any) {
    console.error('Failed to get LLM response:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}

export async function getLLMSuggestions(JSON_DATA: any): Promise<LLMSuggestionsOutput[]> {
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
        role: 'system',
        content: `If the JSON data includes any time field or looks like timeseries, add insights in timeseries format`,
      },
      {
        role: 'user',
        content: [
          'Can you give at least 30 insights of the above JSON data using JQ query language.',
          'List all the insights and their corresponding JQ query in JSON format.',
          'Just return the JSON in JSON format and no markdown.',
          'Output JSON should be array of objects with keys "insight", "description", "jq_query" and "fields"',
          'fields column should be array of field names, user friendly name and their types. Field type should be one of string, number, timestamp, timestamp_epoch, timestamp_epoch_s or boolean. The keys of field should be "selector", "display_name" and "type". "selector" field name should come from JQ output JSON.',
          'If the value of the field with string format looks like date or time field, mark its field type as timestamp',
          'If the value of the field with number format looks like epoch milli seconds timestamp, mark its field type as timestamp_epoch',
          'If the value of the field with number format looks like epoch seconds timestamp, mark its field type as timestamp_epoch_s',
        ].join(' '),
      },
    ];
    const response = await llm.chatCompletions({ model: llm.Model.BASE, messages });
    return JSON.parse(response.choices[0].message?.content || '[]');
  } catch (error: any) {
    console.error('Failed to get LLM response:', error);
    throw new Error(`LLM request failed: ${error.message}`);
  }
}
