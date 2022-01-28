import { DataFrame } from '@grafana/data';
import { parse, evaluate } from 'groq-js';
import { sendAsDataFrame } from './UQLProvider';
import { InfinityQueryFormat } from '../types';

export const getGroqResults = async (query = '*', data: unknown): Promise<any> => {
  let groqQuery = query;
  if (!groqQuery || (groqQuery + '').trim() === '') {
    groqQuery = '*';
  }
  try {
    let dataset = data || [];
    if (typeof dataset === 'string') {
      dataset = JSON.parse(dataset);
    }
    let tree = parse(groqQuery);
    let value = await evaluate(tree, { dataset });
    let result = await value.get();
    return result;
  } catch (ex) {
    throw ex;
  }
};

export const applyGroq = async (query = '*', data: unknown, format: InfinityQueryFormat, refId: string): Promise<DataFrame | DataFrame[]> => {
  try {
    let o = await getGroqResults(query, data);
    return sendAsDataFrame(o, format, refId);
  } catch (ex) {
    throw ex;
  }
};
