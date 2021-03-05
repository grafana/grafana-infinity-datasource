import { BackendServer } from '@grafana/tsbackend';
import { InfinityDiagnosticsService } from './DiagnosticsService';
import { InfinityDataService } from './DataService';
import { InfinityResourceService } from './ResourceService';

const app = new BackendServer();
app.addDiagnosticsService(new InfinityDiagnosticsService());
app.addDataService(new InfinityDataService());
app.addResourceService(new InfinityResourceService());

module.exports = app;