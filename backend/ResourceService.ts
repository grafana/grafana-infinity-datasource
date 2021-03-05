import { ResourceService, CallResourceRequest, CallResourceResponse } from '@grafana/tsbackend';

export class InfinityResourceService extends ResourceService {
  CallResource(request: CallResourceRequest): Promise<CallResourceResponse> {
    throw new Error("Method not implemented.");
  }
}