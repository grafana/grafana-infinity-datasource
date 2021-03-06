"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfinityDataService = void 0;
const tsbackend_1 = require("@grafana/tsbackend");
const InfinityProvider_1 = require("./app/InfinityProvider");
const SeriesProvider_1 = require("./app/SeriesProvider");
const lodash_1 = require("lodash");
class InfinityDataService extends tsbackend_1.DataService {
    constructor() {
        super();
    }
    QueryData(request, context) {
        try {
            const { json } = context.datasourceinstancesettings;
            let { query } = request;
            tsbackend_1.logger.debug("request", request, "context", context);
            const promises = [];
            if (query.type === 'global' &&
                query.global_query_id && (json === null || json === void 0 ? void 0 : json.global_queries) &&
                (json === null || json === void 0 ? void 0 : json.global_queries.length) > 0) {
                let matchingQuery = json === null || json === void 0 ? void 0 : json.global_queries.find((q) => q.id === query.global_query_id);
                query = matchingQuery ? matchingQuery.query : query;
            }
            promises.push(new Promise((resolve, reject) => {
                var _a, _b;
                switch (query.type) {
                    case 'csv':
                    case 'html':
                    case 'json':
                    case 'graphql':
                        new InfinityProvider_1.InfinityProvider(query, context.datasourceinstancesettings)
                            .query()
                            .then(res => res)
                            .catch(ex => {
                            reject(ex);
                        });
                        break;
                    case 'series':
                        new SeriesProvider_1.SeriesProvider(query)
                            .query(((_a = request.timerange) === null || _a === void 0 ? void 0 : _a.fromepochms) || 0, ((_b = request.timerange) === null || _b === void 0 ? void 0 : _b.toepochms) || 0)
                            .then(res => res)
                            .catch(ex => {
                            reject(ex);
                        });
                        break;
                    case 'global':
                        reject('Query not found');
                        break;
                    default:
                        reject('Unknown Query Type');
                        break;
                }
            }));
            return Promise.all(promises).then(results => {
                return lodash_1.flatten(results);
            });
        }
        catch (ex) {
            tsbackend_1.logger.debug("EXCEPTION", ex);
            return Promise.resolve([]);
        }
    }
}
exports.InfinityDataService = InfinityDataService;
//# sourceMappingURL=DataService.js.map