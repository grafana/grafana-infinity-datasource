import { e2e } from '@grafana/e2e';

e2e.scenario({
  describeName: 'Validate inline data',
  itName: 'Validate inline data',
  scenario: () => {
    e2e.flows.openDashboard({ uid: 'e2e-validation' }).then(() => {
      cy.get("section[aria-label='inline json table panel']").should(($p) => {
        expect($p).to.contain(['inline json table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
      cy.get("section[aria-label='inline csv table panel']").should(($p) => {
        expect($p).to.contain(['inline csv table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
      cy.get("section[aria-label='inline xml table panel']").should(($p) => {
        expect($p).to.contain(['inline xml table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
    });
  },
});
e2e.scenario({
  describeName: 'Validate UQL',
  itName: 'Validate UQL',
  scenario: () => {
    e2e.flows.openDashboard({ uid: 'e2e-validation' }).then(() => {
      cy.get("section[aria-label='uql json table panel']").should(($p) => {
        expect($p).to.contain(['uql json table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
      cy.get("section[aria-label='uql csv table panel']").should(($p) => {
        expect($p).to.contain(['uql csv table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
      cy.get("section[aria-label='uql xml table panel']").should(($p) => {
        expect($p).to.contain(['uql xml table', 'city', 'country', 'population', 'chennai', 'india', '300', 'london', 'uk', '200'].join(''));
      });
    });
  },
});
e2e.scenario({
  describeName: 'Validate Big UQL',
  itName: 'Validate Big UQL',
  scenario: () => {
    e2e.flows.openDashboard({ uid: 'e2e-validation' }).then(() => {
      cy.get("section[aria-label='big uql panel']").should(($p) => {
        expect($p).to.contain(
          [
            'big uql',
            'timestamp',
            'value',
            'host',
            'disk',
            'metricId',
            '2069-11-11 22:38:20',
            '11.1',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3F',
            'builtin:host.disk.avail',
            '2069-11-11 22:38:20',
            '111',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3D',
            'builtin:host.disk.avail',
            '2069-11-11 22:38:20',
            '1.10',
            'HOST-F1266E1D0AAC2C3C',
            'builtin:host.cpu.idle',
            '2069-11-11 23:38:20',
            '22.2',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3F',
            'builtin:host.disk.avail',
            '2069-11-11 23:38:20',
            '222',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3D',
            'builtin:host.disk.avail',
            '2069-11-11 23:38:20',
            '2.20',
            'HOST-F1266E1D0AAC2C3C',
            'builtin:host.cpu.idle',
            '2069-11-12 00:38:20',
            '33.3',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3F',
            'builtin:host.disk.avail',
            '2069-11-12 00:38:20',
            '333',
            'HOST-F1266E1D0AAC2C3C',
            'DISK-F1266E1D0AAC2C3D',
            'builtin:host.disk.avail',
            '2069-11-12 00:38:20',
            '3.30',
            'HOST-F1266E1D0AAC2C3C',
            'builtin:host.cpu.idle',
          ].join('')
        );
      });
    });
  },
});
