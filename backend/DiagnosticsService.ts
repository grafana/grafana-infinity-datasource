import { logger as log, CheckHealthRequest, CheckHealthResponse, DiagnosticsService, CollectMetricsRequest, CollectMetricsResponse } from '@grafana/tsbackend';

export class InfinityDiagnosticsService extends DiagnosticsService {
  CheckHealth = async (request: CheckHealthRequest): Promise<CheckHealthResponse> => {
    log.debug("We got a check health request", request.toObject().plugincontext?.datasourceinstancesettings?.decryptedsecurejsondataMap);
    const secureJsonData = request.toObject().plugincontext?.datasourceinstancesettings?.decryptedsecurejsondataMap || [];
    const response: CheckHealthResponse = new CheckHealthResponse();
    response.setStatus(CheckHealthResponse.HealthStatus.UNKNOWN);
    response.setMessage("Not sure what the problem is... But there is one"); 
    if (secureJsonData.length > 0) {      
      response.setStatus(CheckHealthResponse.HealthStatus.OK)
      response.setMessage(`Connection successful.`);      
    }
    return Promise.resolve(response);
  }
  CollectMetrics = (request: CollectMetricsRequest): Promise<CollectMetricsResponse> => {
    throw new Error("Method not implemented.");
  }
}