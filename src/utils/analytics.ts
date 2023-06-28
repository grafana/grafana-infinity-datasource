import { reportInteraction, config } from '@grafana/runtime';
import { isBackendQuery } from './../app/utils';
import { InfinityInstanceSettings, InfinityQuery } from './../types';

type Report_Action = 'grafana_infinity_query_executed' | 'grafana_infinity_health_check_executed';

const reportActivity = (action: Report_Action, meta?: Record<string, any>) => {
  try {
    reportInteraction(action, { ...meta, plugin_name: 'yesoreyeram-infinity-datasource', ts: new Date().getTime() });
  } catch (ex) {
    console.error('error while reporting infinity query', ex);
  }
};

export const reportHealthCheck = (meta: Record<string, string> = {}) => {
  reportActivity('grafana_infinity_health_check_executed', meta);
};

export const reportQuery = (queries: InfinityQuery[] = [], instance_settings?: InfinityInstanceSettings) => {
  let input: Record<string, number | string> = {};
  for (const query of queries) {
    input['grafana_buildInfo_edition'] = config?.buildInfo?.edition || '';
    input['grafana_buildInfo_version'] = config?.buildInfo?.version || '';
    input['grafana_licenseInfo_stateInfo'] = config?.licenseInfo?.stateInfo || '';
    if (instance_settings) {
      input['config_authType'] = instance_settings.jsonData?.authType || 'unknown';
      input['config_oauth2_type'] = instance_settings.jsonData?.oauth2?.oauth2_type || 'unknown';
    }
    input['query_type'] = query.type;
    input['query_source'] = (query as any).source || 'unknown';
    input['query_parser'] = (query as any).parser || 'unknown';
    const queryUrl = (query as any).url || '';
    if (queryUrl) {
      try {
        const baseUrl = new URL(queryUrl);
        input['query_url_host'] = baseUrl.host || baseUrl.hostname;
        input['query_url_path'] = baseUrl.pathname;
      } catch (ex) {
        console.error(ex);
      }
    }
    if (isBackendQuery(query)) {
      if (query.summarizeExpression) {
        input['query_summarizeExpression'] = 'in_use';
      }
      if (query.summarizeBy) {
        input['query_summarizeBy'] = 'in_use';
      }
      if (query.filterExpression) {
        input['query_filterExpression'] = 'in_use';
      }
      if (query.computed_columns && query.computed_columns.length > 0) {
        input['query_computed_columns'] = query.computed_columns.length;
      }
    }
    reportActivity('grafana_infinity_query_executed', input);
  }
};
