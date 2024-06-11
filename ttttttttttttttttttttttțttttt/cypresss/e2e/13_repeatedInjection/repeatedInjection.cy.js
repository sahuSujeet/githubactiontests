/// <reference types="Cypress"/>
const { getE2ETestBaseUrl, getBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');

describe('13_repeatedInjection', () => {

  describe('repeatedInjection', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('13_repeatedInjection/repeatedInjection'));
    });

    it('must report beacons with different key', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
            expect(beacon.k).to.equal('key2');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('myTestEvent1');
            expect(beacon.k).to.equal('key1');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('cus');
            expect(beacon.ts).to.be.a('string');
            expect(beacon.n).to.equal('myTestEvent2');
            expect(beacon.k).to.equal('key2');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('xhr');
            expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?r=11&cacheBust=\d+$/);
            expect(beacon.k).to.equal('key1');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('xhr');
            expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?r=22&cacheBust=\d+$/);
            expect(beacon.k).to.equal('key2');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
          });
        });
      });
    });
  });
});
