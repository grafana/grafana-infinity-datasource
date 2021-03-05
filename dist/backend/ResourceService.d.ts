import { ResourceService, CallResourceRequest, CallResourceResponse } from '@grafana/tsbackend';
export declare class InfinityResourceService extends ResourceService {
    CallResource(request: CallResourceRequest): Promise<CallResourceResponse>;
}
