/// <reference types="Cypress"/>
const { getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');

describe('09_customEvents', () => {

  afterEach(()=>{
    deleteBeacons();
  })

  describe('simpleEventReporting', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('09_customEvents/simpleEventReporting'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.d).to.equal('42');
            expect(beacon.n).to.equal('myTestEvent');
            expect(beacon.l).to.be.a('string');
            expect(beacon.e).to.match(/Testing 123/);
            expect(beacon.st).to.be.a('string');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.cs).to.equal('a component stack');
            expect(beacon.m_name).to.equal('Tom');
            expect(beacon.m_age).to.equal('23');
            expect(beacon.m_kind).to.equal('experienced');
            expect(beacon.m_state).to.equal('broken');
            expect(beacon.bt).to.equal('ab87128a1ff99345');
            expect(beacon.cm).to.equal('123.2342');
          });
        });
      });
    });
  });

  describe('simpleEventReportingWithoutBackendTraceId', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('09_customEvents/simpleEventReportingWithoutBackendTraceId'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithEmptyBackendTraceId');
            expect(beacon.e).to.match(/Testing 123/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithNoBackendTraceId');
            expect(beacon.e).to.match(/something wrong/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithInvalidBackendTraceId');
            expect(beacon.e).to.match(/something wrong/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.be.undefined;
          });
        });
      });
    });
  });

  describe('simpleEventReportingWithoutCustomMetric', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('09_customEvents/simpleEventReportingWithoutCustomMetric'));
    });

    it('must report custom events', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithEmptyCustomMetric');
            expect(beacon.e).to.match(/Testing 123/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.equal('ab87128a1ff99345');
            expect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithNoCustomMetric');
            expect(beacon.e).to.match(/something wrong/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.equal('ab87128a1ff99345');
            expect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithIncorrectCustomMetric');
            expect(beacon.e).to.match(/something wrong/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.equal('ab87128a1ff99345');
            expect(beacon.cm).to.be.undefined;
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('testWithExponentialCustomMetric(1e5)');
            expect(beacon.e).to.match(/something wrong/);
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.bt).to.equal('ab87128a1ff99345');
            expect(beacon.cm).to.equal('100000'); 
          });
        });
      });
    });
  });
});
