/// <reference types="Cypress"/>

const { getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');

describe('03_transmission', () => {

  afterEach(()=>{
    deleteBeacons();
  })
  
  describe('with enabled batching', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: true
      }))
    });

    tests();
  });

  describe('with disabled batching', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: false
      }));
    });
    
    tests();
  });

  function tests() {
    it('must report beacons', async () => {
      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons).to.have.lengthOf(3);

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.s).to.equal(undefined);
          expect(beacon.ty).to.equal('pl');
          expect(beacon.k).to.equal('key_0');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
          expect(beacon.d).to.equal('42');
          expect(beacon.n).to.equal('firstEvent');
          expect(beacon.m_customEvent).to.equal('1');
          expect(beacon.k).to.equal('key_0');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
          expect(beacon.d).to.equal('43');
          expect(beacon.n).to.equal('secondEvent');
          expect(beacon.m_foo).to.equal('bar');
          expect(beacon.k).to.equal('key_0');
        });
      });
    });
  }

  describe('multi-backens with enabled batching', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: true,
        withMultiBackends: true
      }));
    });

    tests_multi_backends();
  });

  describe('multi-backends with disabled batching', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('03_transmission/transmission', {
        withRequestBatching: false,
        withMultiBackends: true
      }));
    });

    tests_multi_backends();
  });

  function tests_multi_backends() {
    it('must report beacons to multiple backends', async () => {
      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons).to.have.lengthOf(6);

        const pageLoadBeacon_1 = expectOneMatching(beacons, beacon => {
          expect(beacon.s).to.equal(undefined);
          expect(beacon.ty).to.equal('pl');
          expect(beacon.k).to.equal('key_1');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon_1.t);
          expect(beacon.d).to.equal('42');
          expect(beacon.n).to.equal('firstEvent');
          expect(beacon.m_customEvent).to.equal('1');
          expect(beacon.k).to.equal('key_1');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon_1.t);
          expect(beacon.d).to.equal('43');
          expect(beacon.n).to.equal('secondEvent');
          expect(beacon.m_foo).to.equal('bar');
          expect(beacon.k).to.equal('key_1');
        });

        const pageLoadBeacon_2 = expectOneMatching(beacons, beacon => {
          expect(beacon.s).to.equal(undefined);
          expect(beacon.ty).to.equal('pl');
          expect(beacon.k).to.equal('key_2');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon_2.t);
          expect(beacon.d).to.equal('42');
          expect(beacon.n).to.equal('firstEvent');
          expect(beacon.m_customEvent).to.equal('1');
          expect(beacon.k).to.equal('key_2');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.pl).to.equal(pageLoadBeacon_2.t);
          expect(beacon.d).to.equal('43');
          expect(beacon.n).to.equal('secondEvent');
          expect(beacon.m_foo).to.equal('bar');
          expect(beacon.k).to.equal('key_2');
        });
      });
    });
  }
});
