/// <reference types="Cypress"/>
const {getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');


describe('06_wrapTimers', () => {

  afterEach(() => {
    deleteBeacons();
  });

  describe('sameOriginErrors', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('06_wrapTimers/sameOriginErrors'));
    });

    afterEach(()=>{
      deleteBeacons();
    })

    it('must send only one error beacon for setTimeout errors', async () => {
      cy.on("uncaught:exception", (e, runnable) => {
        if (e.message.includes("This is intended for testing purposes: st"))
          return false;
      });
      await cy.get("#forceSetTimeout").click();
      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons.filter(b => b.ty === 'err').length).to.equal(1, JSON.stringify(beacons, 0, 2));

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('err');
          expect(beacon.e).to.match(new RegExp(getErrorMessage('st')));
          expect(beacon.c).to.equal('1');
        });
      });
    });

    it('must catch errors in setInterval', async () => {
      cy.on("uncaught:exception", (e, runnable) => {
        if (e.message.includes("This is intended for testing purposes: si"))
          return false;
      });
      await cy.get("#forceSetInterval").click();
      await retry(async () => {
        const beacons = await getBeacons();
        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('err');
          expect(beacon.e).to.match(new RegExp(getErrorMessage('si')));
        });
      });
    });
  });

  describe('crossOriginErrors', () => {

    afterEach(() => {
      deleteBeacons();
    })

    describe('with wrapTimers enabled', () => {
      beforeEach(() => {
        cy.visit(getE2ETestBaseUrl('06_wrapTimers/crossOriginErrors'));
      });

      it('must send meaningful error messages', async () => {
        cy.on("uncaught:exception", (e, runnable) => {
          if (e.message.includes("This is intended for testing purposes: st"))
            return false;
        });
        await cy.get("#forceSetTimeout").click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            expect(beacon.e).to.match(new RegExp(getErrorMessage('st')));
          });
        });
      });
    });

    describe('with wrapTimers disabled', () => {
      beforeEach(() => {
        cy.visit(getE2ETestBaseUrl('06_wrapTimers/crossOriginErrors', {
          disableWrapTimers: true
        }));
      });

      it('must fall back to Script error', async () => {
        cy.on("uncaught:exception", (e, runnable) => {
            return false;
        });
        await cy.get("#forceSetTimeout").click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            // some browsers actually expose error messages even in cross-origin situations,
            // e.g. Firefox 45 and Internet Explorer 11
            expect(beacon.e).to.match(new RegExp('Script error|' + getErrorMessage('st')));
          });
        });
      });
    });
  });

  function getErrorMessage(timerVarArgParam) {
    return 'This is intended for testing purposes: ' + timerVarArgParam;
  }
});
