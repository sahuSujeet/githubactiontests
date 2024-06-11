/// <reference types="Cypress"/>
import { getE2ETestBaseUrl, getBeacons, deleteBeacons } from '../../../server/controls';
import { retry, expectOneMatching } from '../../../util';

describe('11_userTiming', () => {

  afterEach(()=>{
    deleteBeacons();
  });

  describe('various user timings', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('11_userTiming/userTiming'));
    });

    it('must report user timing data as custom events',  () => {
      retry(async () => {
        const beacons = await getBeacons();
        const pageLoadBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('pl');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.n).to.equal('domComplete');
          expect(beacon.ts).to.be.a('string');
          expect(Number(beacon.d)).to.be.at.most(Number(pageLoadBeacon.d));
          expect(beacon.l).to.be.a('string');
          expect(beacon.pl).to.equal(pageLoadBeacon.t);
          expect(beacon.m_userTimingType).to.equal('measure');
        });

        const startWorkBeacon = expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.n).to.equal('startWork');
          expect(beacon.d).not.to.equal('0');
          expect(beacon.m_userTimingType).to.equal('mark');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.n).to.equal('endWork');
          expect(Number(beacon.ts)).to.be.at.least(Number(startWorkBeacon.ts));
          expect(beacon.d).not.to.equal('0');
          expect(beacon.m_userTimingType).to.equal('mark');
        });

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('cus');
          expect(beacon.n).to.equal('work');
          expect(Number(beacon.ts)).to.equal(Number(startWorkBeacon.ts) + Number(startWorkBeacon.d));
          expect(beacon.d).not.to.equal('0');
          expect(beacon.m_userTimingType).to.equal('measure');
        });

        beacons.forEach(beacon => {
          if (beacon.ty === 'cus') {
            expect(beacon.n).not.to.have.string('⚛');
            expect(beacon.n).not.to.have.string('⛔');
            expect(beacon.n).not.to.have.string('Zone');
          }
        });
      });
    });
  });
});
