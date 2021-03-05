import { DataFrame, DataService, DataRequest } from '@grafana/tsbackend';
import { InfinityQuery } from '../shared//types';
export declare class InfinityDataService extends DataService<InfinityQuery> {
    constructor();
    QueryData(request: DataRequest<InfinityQuery>): Promise<DataFrame[]>;
}
