import { DataFrame, DataService, DataQuery, PluginContext } from '@grafana/tsbackend';
import { InfinityQuery, InfinityOptions } from '../shared/types';
export declare class InfinityDataService extends DataService<InfinityQuery, InfinityOptions> {
    constructor();
    QueryData(request: DataQuery<InfinityQuery>, context: PluginContext<InfinityOptions>): Promise<DataFrame[]>;
}
