"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsbackend_1 = require("@grafana/tsbackend");
const DiagnosticsService_1 = require("./DiagnosticsService");
const DataService_1 = require("./DataService");
const ResourceService_1 = require("./ResourceService");
const app = new tsbackend_1.BackendServer();
app.addDiagnosticsService(new DiagnosticsService_1.InfinityDiagnosticsService());
app.addDataService(new DataService_1.InfinityDataService());
app.addResourceService(new ResourceService_1.InfinityResourceService());
module.exports = app;
//# sourceMappingURL=index.js.map