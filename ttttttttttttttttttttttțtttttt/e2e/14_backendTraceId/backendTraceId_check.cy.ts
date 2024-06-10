/// <reference types='Cypress'/>
import { getE2ETestBaseUrl, getBeacons, deleteBeacons  } from '../../../server/controls';
import {retry} from '../../../util';

describe('backendTraceId', () => {
  afterEach(() => {
    deleteBeacons();
  });

  describe('14_backendTraceId', () => {

    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('14_backendTraceId/backendTraceId_check'));
    });

    it('must check if backend trace ID is available in transmitted beacon', () => {
      retry(() => {
        return getBeacons()
          .then(beacons => {
            expect(beacons).to.have.lengthOf(33);
            const xhrBeacons = beacons.filter(beacon => beacon.ty === 'xhr');
            xhrBeacons.map(xhrBeacon => {
              expect(xhrBeacon.bt).to.not.equal(undefined);
              expect(xhrBeacon.bt).to.equal('aFakeBackendTraceIdForTests');
            });
          });
      });
    });
  });
});

