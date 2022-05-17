import { e2e } from '@grafana/e2e';

e2e.scenario({
  describeName: 'Smoke tests',
  itName: 'Smoke tests',
  scenario: () => {
    e2e.flows.addDataSource({
      type: 'Infinity',
      expectedAlertMessage: 'Settings saved',
    });
  },
});
