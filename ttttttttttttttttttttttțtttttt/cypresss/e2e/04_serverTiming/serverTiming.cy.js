/// <reference types="Cypress"/>
const {getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const util = require('../../util');

describe('04_serverTiming', () => {
  beforeEach(() => {
    cy.visit(getE2ETestBaseUrl('04_serverTiming/serverTiming'));
  });

  afterEach(() => {
    deleteBeacons();
  });

  it('must read backend trace ID when available from server timing header', () => {
    return util.retry(() => {
      return getBeacons()
        .then(beacons => {
          expect(beacons).to.have.lengthOf(1);
          expect(beacons[0].bt).to.equal('aFakeBackendTraceIdForTests');
        });
    });
  });
});
