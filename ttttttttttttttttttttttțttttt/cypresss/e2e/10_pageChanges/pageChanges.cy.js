/// <reference types="Cypress"/>
const { getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');


describe('10_pageChanges', () => {

  afterEach(() => {
    deleteBeacons();
  })

  describe('pageChanges', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('10_pageChanges/pageChanges'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('first');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('second');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(1);
        expect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });

  describe('changingBackToPreviousPage', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('10_pageChanges/changingBackToPreviousPage'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('first');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('second');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(2);
        expect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });

  describe('pageChangesDuringOnLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('10_pageChanges/pageChangesDuringOnLoad'));
    });

    it('must send page change events', () => {
      return retry(async () => {
        const beacons = await getBeacons();

        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pl');
          expect(beacon.p).to.equal('second');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('second');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pc');
          expect(beacon.ts).to.be.a('string');
          expect(beacon.p).to.equal('third');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
        });

        expect(beacons.filter(b => b.p === 'first' && b.ty === 'pc')).to.have.lengthOf(0);
        expect(beacons.filter(b => b.p === 'second' && b.ty === 'pc')).to.have.lengthOf(1);
        expect(beacons.filter(b => b.p === 'third' && b.ty === 'pc')).to.have.lengthOf(1);
      });
    });
  });
});
