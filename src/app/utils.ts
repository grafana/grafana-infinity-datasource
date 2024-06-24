import { ArrayVector, MutableDataFrame, FieldType, DataFrame, Field, Labels, TableData } from '@grafana/data';
import type {
  InfinityCSVQuery,
  InfinityGraphQLQuery,
  InfinityHTMLQuery,
  InfinityJSONQuery,
  InfinityQuery,
  InfinityQueryWithDataSource,
  InfinityQueryWithURLSource,
  InfinityXMLQuery,
  InfinityQueryType,
} from './../types';

export const isTableData = (res: any): res is TableData => res && res.columns;
export const isDataFrame = (res: any): res is DataFrame => res && res.fields;
export const isCSVQuery = (query: InfinityQuery): query is InfinityCSVQuery => query.type === 'csv';
export const isJSONQuery = (query: InfinityQuery): query is InfinityJSONQuery => query.type === 'json';
export const isXMLQuery = (query: InfinityQuery): query is InfinityXMLQuery => query.type === 'xml';
export const isGraphQLQuery = (query: InfinityQuery): query is InfinityGraphQLQuery => query.type === 'graphql';
export const isHTMLQuery = (query: InfinityQuery): query is InfinityHTMLQuery => query.type === 'html';

export const isBackendQuerySupported = (
  query: InfinityQuery
): query is Extract<InfinityQuery, { type: 'json' } | { type: 'csv' } | { type: 'tsv' } | { type: 'xml' } | { type: 'graphql' } | { type: 'html' }> =>
  query.type === 'json' || query.type === 'csv' || query.type === 'tsv' || query.type === 'graphql' || query.type === 'xml' || query.type === 'html';
export const isBackendQuery = (
  query: InfinityQuery
): query is Extract<InfinityQuery, ({ type: 'json' } | { type: 'csv' } | { type: 'tsv' } | { type: 'xml' } | { type: 'graphql' } | { type: 'html' }) & { parser: 'backend' }> =>
  query.type === 'transformations' || (isBackendQuerySupported(query) && query.parser === 'backend');

export const isDataQuery = (query: InfinityQuery): query is InfinityQueryWithDataSource<any> => {
  switch (query.type) {
    case 'csv':
    case 'tsv':
    case 'json':
    case 'xml':
    case 'graphql':
    case 'html':
    case 'uql':
    case 'groq':
      return true;
    default:
      return false;
  }
};

// We have to have query: unknown here as InfinityQuery and InfinityQueryWithURLSource<InfinityQueryType> are not compatible according to TypeScript
export const isInfinityQueryWithUrlSource = (query: unknown): query is InfinityQueryWithURLSource<InfinityQueryType> => {
  // We do a basic check to ensure that query is an object and has a type property
  if (!query || typeof query !== 'object' || !('type' in query)) {
    return false;
  }

  // we check if the query is a data query or has suitable type
  if (isDataQuery(query as InfinityQuery) || query.type === 'uql' || query.type === 'groq') {
    // It needs to have a source property and it should be 'url'
    if ('source' in query) {
      return query.source === 'url';
    }
  }

  return false;
};
export const toTimeSeriesLong = (data: DataFrame[]): DataFrame[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }
  const result: DataFrame[] = [];
  for (const frame of data) {
    let timeField: Field | undefined;
    const uniqueValueNames: string[] = [];
    const uniqueValueNamesToType: Record<string, FieldType> = {};
    const uniqueLabelKeys: Record<string, boolean> = {};
    const labelKeyToWideIndices: Record<string, number[]> = {};
    const uniqueFactorNamesToWideIndex: Record<string, number> = {};

    for (let fieldIndex = 0; fieldIndex < frame.fields.length; fieldIndex++) {
      const field = frame.fields[fieldIndex];

      switch (field.type) {
        case FieldType.string:
        case FieldType.boolean:
          if (field.name in uniqueFactorNamesToWideIndex) {
            // TODO error?
          } else {
            uniqueFactorNamesToWideIndex[field.name] = fieldIndex;
            uniqueLabelKeys[field.name] = true;
          }
          break;
        case FieldType.time:
          if (!timeField) {
            timeField = field;
            break;
          }
        default:
          if (field.name in uniqueValueNamesToType) {
            const type = uniqueValueNamesToType[field.name];

            if (field.type !== type) {
              // TODO error?
              continue;
            }
          } else {
            uniqueValueNamesToType[field.name] = field.type;
            uniqueValueNames.push(field.name);
          }
          // eslint-disable-next-line no-case-declarations
          const tKey = JSON.stringify(field.labels);
          // eslint-disable-next-line no-case-declarations
          const wideIndices = labelKeyToWideIndices[tKey];

          if (wideIndices !== undefined) {
            wideIndices.push(fieldIndex);
          } else {
            labelKeyToWideIndices[tKey] = [fieldIndex];
          }

          if (field.labels != null) {
            for (const labelKey in field.labels) {
              uniqueLabelKeys[labelKey] = true;
            }
          }
      }
    }

    if (!timeField) {
      continue;
    }

    type TimeWideRowIndex = {
      time: any;
      wideRowIndex: number;
    };
    const sortedTimeRowIndices: TimeWideRowIndex[] = [];
    const sortedUniqueLabelKeys: string[] = [];
    const uniqueFactorNames: string[] = [];
    const uniqueFactorNamesWithWideIndices: string[] = [];

    for (let wideRowIndex = 0; wideRowIndex < frame.length; wideRowIndex++) {
      sortedTimeRowIndices.push({ time: timeField.values.get(wideRowIndex), wideRowIndex: wideRowIndex });
    }

    for (const labelKeys in labelKeyToWideIndices) {
      sortedUniqueLabelKeys.push(labelKeys);
    }
    for (const labelKey in uniqueLabelKeys) {
      uniqueFactorNames.push(labelKey);
    }
    for (const name in uniqueFactorNamesToWideIndex) {
      uniqueFactorNamesWithWideIndices.push(name);
    }

    sortedTimeRowIndices.sort((a, b) => a.time - b.time);
    sortedUniqueLabelKeys.sort();
    uniqueFactorNames.sort();
    uniqueValueNames.sort();

    const longFrame = new MutableDataFrame({
      ...frame,
      meta: { ...frame.meta },
      fields: [{ name: timeField.name, type: timeField.type }],
    });

    for (const name of uniqueValueNames) {
      longFrame.addField({ name: name, type: uniqueValueNamesToType[name] });
    }

    for (const name of uniqueFactorNames) {
      longFrame.addField({ name: name, type: FieldType.string });
    }

    for (const timeWideRowIndex of sortedTimeRowIndices) {
      const { time, wideRowIndex } = timeWideRowIndex;

      for (const labelKeys of sortedUniqueLabelKeys) {
        const rowValues: Record<string, any> = {};

        for (const name of uniqueFactorNamesWithWideIndices) {
          rowValues[name] = frame.fields[uniqueFactorNamesToWideIndex[name]].values.get(wideRowIndex);
        }

        let index = 0;

        for (const wideFieldIndex of labelKeyToWideIndices[labelKeys]) {
          const wideField = frame.fields[wideFieldIndex];

          if (index++ === 0 && wideField.labels != null) {
            for (const labelKey in wideField.labels) {
              rowValues[labelKey] = wideField.labels[labelKey];
            }
          }

          rowValues[wideField.name] = wideField.values.get(wideRowIndex);
        }

        rowValues[timeField.name] = time;
        longFrame.add(rowValues);
      }
    }

    result.push(longFrame);
  }

  return result;
};
export const toTimeSeriesMany = (data: DataFrame[]): DataFrame[] => {
  if (!Array.isArray(data) || data.length === 0) {
    return data;
  }
  const result: DataFrame[] = [];
  for (const frame of toTimeSeriesLong(data)) {
    const timeField = frame.fields[0];
    if (!timeField || timeField.type !== FieldType.time) {
      continue;
    }
    const valueFields: Field[] = [];
    const labelFields: Field[] = [];
    for (const field of frame.fields) {
      switch (field.type) {
        case FieldType.number:
        case FieldType.boolean:
          valueFields.push(field);
          break;
        case FieldType.string:
          labelFields.push(field);
          break;
      }
    }

    for (const field of valueFields) {
      if (labelFields.length) {
        // new frame for each label key
        type frameBuilder = {
          time: number[];
          value: number[];
          key: string;
          labels: Labels;
        };
        const builders = new Map<string, frameBuilder>();
        for (let i = 0; i < frame.length; i++) {
          const time = timeField.values.get(i);
          const value = field.values.get(i);
          if (value === undefined || time == null) {
            continue; // skip values left over from join
          }

          const key = labelFields.map((f) => f.values.get(i)).join('/');
          let builder = builders.get(key);
          if (!builder) {
            builder = {
              key,
              time: [],
              value: [],
              labels: {},
            };
            for (const label of labelFields) {
              builder.labels[label.name] = label.values.get(i);
            }
            builders.set(key, builder);
          }
          builder.time.push(time);
          builder.value.push(value);
        }

        // Add a frame for each distinct value
        for (const b of builders.values()) {
          result.push({
            name: frame.name,
            refId: frame.refId,
            meta: {
              ...frame.meta,
            },
            fields: [
              {
                ...timeField,
                values: new ArrayVector(b.time),
              },
              {
                ...field,
                values: new ArrayVector(b.value),
                labels: b.labels,
              },
            ],
            length: b.time.length,
          });
        }
      } else {
        result.push({
          name: frame.name,
          refId: frame.refId,
          meta: {
            ...frame.meta,
          },
          fields: [timeField, field],
          length: frame.length,
        });
      }
    }
  }
  return result;
};
