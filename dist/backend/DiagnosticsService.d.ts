import { CheckHealthRequest, CheckHealthResponse, DiagnosticsService, CollectMetricsRequest, CollectMetricsResponse } from '@grafana/tsbackend';
export declare class InfinityDiagnosticsService extends DiagnosticsService {
    CheckHealth: (request: CheckHealthRequest) => Promise<CheckHealthResponse>;
    CollectMetrics: (request: CollectMetricsRequest) => Promise<CollectMetricsResponse>;
}
