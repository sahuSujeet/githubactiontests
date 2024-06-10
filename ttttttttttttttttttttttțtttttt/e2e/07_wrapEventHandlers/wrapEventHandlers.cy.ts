/// <reference types='Cypress'/>
import {getE2ETestBaseUrl, getBeacons, deleteBeacons } from '../../../server/controls';
import { retry, expectOneMatching } from '../../../util';

describe('07_wrapEventHandlers', () => {

  afterEach(() => {
    deleteBeacons();
  });

  describe('sameOriginErrors', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('07_wrapEventHandlers/sameOriginErrors'));
    });

    it('must send only one error beacon for handler errors', async () => {
      cy.on('uncaught:exception', (e, runnable) => {
        if (e.message.includes('This is intended for testing purposes'))
          return false;
      });
      cy.get('#clickError').click();
      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons.filter(b => b.ty === 'err').length).to.equal(1);

        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('err');
          expect(beacon.e).to.match(/This is intended for testing purposes/);
          expect(beacon.c).to.equal('1');
        });
      });
    });
  });

  describe('crossOriginErrors', () => {

    afterEach(() => {
      deleteBeacons();
    });

    describe('with wrapEventHandlers enabled', () => {
      beforeEach(() => {
        cy.visit(getE2ETestBaseUrl('07_wrapEventHandlers/crossOriginErrors'));
      });

      it('must send meaningful error messages', async () => {
        cy.on('uncaught:exception', (e, runnable) => {
          if (e.message.includes('This is intended for testing purposes'))
            return false;
        });
        cy.get('#clickError').click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            expect(beacon.e).to.match(/This is intended for testing purposes/);             
          });
        });
      });
    });

    describe('with wrapEventHandlers disabled', () => {
      beforeEach(() => {
        cy.visit(getE2ETestBaseUrl('07_wrapEventHandlers/crossOriginErrors', {
          disableWrapEventHandlers: true
        }));
      });

      it('must fall back to Script error', async () => {
        cy.on('uncaught:exception', (e, runnable) => {
          return false;
        });

        cy.get('#clickError').click();
        await retry(async () => {
          const beacons = await getBeacons();
          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            // some browsers actually expose error messages even in cross-origin situations,
            // e.g. Firefox 45 and Internet Explorer 11
            expect(beacon.e).to.match(/Script error|This is intended for testing purposes/);
          });
        });
      });
    });
  });

  describe('with wrapEventHandlers enabled', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('07_wrapEventHandlers/eventListenerRemoval'));
    });
  
    it('must not break removal of event listeners', () => {
      cy.get('#button').click();
      cy.get('#button').click();
      cy.get('#button').click();
      cy.get('#button').click();
  
      cy.get('#output').invoke('text').then((text) => {
        const value = parseInt(text); // Convert text to a number 
        expect(text).to.equal('0');
      });
    });
  });
});
