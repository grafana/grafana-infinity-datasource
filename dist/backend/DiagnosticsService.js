"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfinityDiagnosticsService = void 0;
const tslib_1 = require("tslib");
const tsbackend_1 = require("@grafana/tsbackend");
class InfinityDiagnosticsService extends tsbackend_1.DiagnosticsService {
    constructor() {
        super(...arguments);
        this.CheckHealth = (request) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            tsbackend_1.logger.debug("We got a check health request", (_b = (_a = request.toObject().plugincontext) === null || _a === void 0 ? void 0 : _a.datasourceinstancesettings) === null || _b === void 0 ? void 0 : _b.decryptedsecurejsondataMap);
            const secureJsonData = ((_d = (_c = request.toObject().plugincontext) === null || _c === void 0 ? void 0 : _c.datasourceinstancesettings) === null || _d === void 0 ? void 0 : _d.decryptedsecurejsondataMap) || [];
            const response = new tsbackend_1.CheckHealthResponse();
            response.setStatus(tsbackend_1.CheckHealthResponse.HealthStatus.UNKNOWN);
            response.setMessage("Not sure what the problem is... But there is one");
            if (secureJsonData.length > 0) {
                response.setStatus(tsbackend_1.CheckHealthResponse.HealthStatus.OK);
                response.setMessage(`Connection successful.`);
            }
            return Promise.resolve(response);
        });
        this.CollectMetrics = (request) => {
            throw new Error("Method not implemented.");
        };
    }
}
exports.InfinityDiagnosticsService = InfinityDiagnosticsService;
//# sourceMappingURL=DiagnosticsService.js.map