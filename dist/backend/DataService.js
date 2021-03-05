"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfinityDataService = void 0;
const tsbackend_1 = require("@grafana/tsbackend");
const data_1 = require("@grafana/data");
class InfinityDataService extends tsbackend_1.DataService {
    constructor() {
        super();
    }
    QueryData(request) {
        return Promise.resolve([{
                name: 'some data',
                fields: [{
                        name: 'time',
                        config: {},
                        type: data_1.FieldType.time,
                        values: new data_1.ArrayVector([Date.now()]),
                    }, {
                        name: 'value',
                        config: {},
                        type: data_1.FieldType.number,
                        values: new data_1.ArrayVector([1]),
                    }],
                length: 2,
            }]);
    }
}
exports.InfinityDataService = InfinityDataService;
//# sourceMappingURL=DataService.js.map