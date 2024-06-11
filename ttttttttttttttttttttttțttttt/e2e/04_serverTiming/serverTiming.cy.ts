/// <reference types="Cypress"/>
import {getE2ETestBaseUrl, getBeacons, deleteBeacons } from '../../../server/controls';
import {retry} from '../../../util';

describe('04_serverTiming', () => {
  beforeEach(() => {
    cy.visit(getE2ETestBaseUrl('04_serverTiming/serverTiming'));
  });

  afterEach(() => {
    deleteBeacons();
  });

  it('must read backend trace ID when available from server timing header', () => {
    return retry(() => {
      return getBeacons()
        .then(beacons => {
          expect(beacons).to.have.lengthOf(1);
          expect(beacons[0].bt).to.equal('aFakeBackendTraceIdForTests');
        });
    });
  });
});
