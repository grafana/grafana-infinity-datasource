import { CoreApp, DataSourcePluginMeta, TestDataSourceResponse } from '@grafana/data';
import { reportInteraction, config } from '@grafana/runtime';
import { isBackendQuery } from './../app/utils';
import { InfinityInstanceSettings, InfinityQuery } from './../types';

type Report_Action = 'grafana_infinity_query_executed' | 'grafana_infinity_health_check_executed';

const reportActivity = (action: Report_Action, data: Record<string, any> = {}, instance_settings?: InfinityInstanceSettings, plugin_meta?: DataSourcePluginMeta) => {
  try {
    // Grafana related meta
    data['grafana_licenseInfo_stateInfo'] = config?.licenseInfo?.stateInfo || '';
    data['grafana_buildInfo_edition'] = config?.buildInfo?.edition || '';
    data['grafana_buildInfo_version'] = config?.buildInfo?.version || '';
    data['grafana_buildInfo_version_short'] = (config?.buildInfo?.version || '').split('-')[0];
    data['grafana_app_url'] = config?.appUrl || '';
    const grafana_url = new URL(window?.document?.URL);
    data['grafana_host'] = grafana_url?.host || grafana_url?.hostname || 'unknown';
    // Plugin meta
    data['plugin_id'] = plugin_meta?.id || 'yesoreyeram-infinity-datasource';
    data['plugin_version'] = plugin_meta?.info?.version || 'unknown';
    // Plugin configuration
    data['config_authType'] = instance_settings?.jsonData?.auth_method || instance_settings?.jsonData?.authType || 'unknown';
    data['config_oauth2_type'] = instance_settings?.jsonData?.oauth2?.oauth2_type || 'unknown';
    data['config_global_queries_count'] = (instance_settings?.jsonData?.global_queries || []).length;
    data['config_reference_data_count'] = (instance_settings?.jsonData?.refData || []).length;
    data['config_allowed_hosts_count'] = (instance_settings?.jsonData?.allowedHosts || []).length;
    data['config_custom_health_check_enabled'] = instance_settings?.jsonData?.customHealthCheckEnabled ? 'enabled' : 'unknown';
    reportInteraction(action, { ...data, ts: new Date().getTime() });
  } catch (ex) {
    console.error('error while reporting infinity query', ex);
  }
};

export const reportHealthCheck = (o?: Omit<TestDataSourceResponse, 'details'>, instance_settings?: InfinityInstanceSettings, plugin_meta?: DataSourcePluginMeta) => {
  let meta: Record<string, any> = {
    plugin_healthcheck_status: o?.status || 'unknown',
    plugin_healthcheck_message: o?.message || 'unknown',
  };
  reportActivity('grafana_infinity_health_check_executed', meta, instance_settings, plugin_meta);
};

export const reportQuery = (queries: InfinityQuery[] = [], instance_settings?: InfinityInstanceSettings, plugin_meta?: DataSourcePluginMeta, app = 'unknown') => {
  if (app === CoreApp.Dashboard || app === CoreApp.PanelViewer) {
    return;
  }
  let meta: Record<string, number | string> = {};
  for (const query of queries) {
    meta['grafana_app'] = app;
    meta['query_type'] = (query as any).type || 'unknown';
    meta['query_source'] = (query as any).source || 'unknown';
    meta['query_parser'] = (query as any).parser || 'unknown';
    meta['query_format'] = (query as any).format || 'unknown';
    const queryUrl = (query as any).url || '';
    if (queryUrl) {
      try {
        const baseUrl = new URL(queryUrl);
        meta['query_url_host'] = baseUrl.host || baseUrl.hostname;
      } catch (ex) {
        console.error(ex);
      }
    }
    if (isBackendQuery(query)) {
      if (query.summarizeExpression) {
        meta['query_summarizeExpression'] = 'in_use';
      }
      if (query.summarizeBy) {
        meta['query_summarizeBy'] = 'in_use';
      }
      if (query.filterExpression) {
        meta['query_filterExpression'] = 'in_use';
      }
      if (query.computed_columns && query.computed_columns.length > 0) {
        meta['query_computed_columns'] = query.computed_columns.length;
      }
      meta['query_pagination_mode'] = query.pagination_mode || 'none';
    }
    reportActivity('grafana_infinity_query_executed', meta, instance_settings, plugin_meta);
  }
};
