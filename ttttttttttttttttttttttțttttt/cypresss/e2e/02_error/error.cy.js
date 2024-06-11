/// <reference types="Cypress"/>
const { getE2ETestBaseUrl, getBeacons, deleteBeacons } = require('../../server/controls');
const { retry, expectOneMatching } = require('../../util');

describe('02_error', () => {
  afterEach(() => {
    deleteBeacons();
  })

  describe('automatic reporting', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('02_error/automatic'));
    });

    afterEach(() => {
      deleteBeacons();
    })

    it('must send single error beacon', () => {
      cy.on("uncaught:exception", (e, runnable) => {
        if (e.message.includes("This is intended for testing purposes."))
          return false;
      });
      return cy.get("#first").click()
        .then(() => {
          return retry(() => {
            return getBeacons().then(beacons => {
              const pageLoadBeacon = expectOneMatching(beacons, beacon => {
                expect(beacon.ty).to.equal('pl');
              });

              expectOneMatching(beacons, beacon => {
                expect(beacon.ty).to.equal('err');
                expect(beacon.e).to.match(/This is intended for testing purposes/);
                expect(beacon.st).to.be.a('string');
                expect(beacon.c).to.equal('1');
                expect(beacon.pl).to.equal(pageLoadBeacon.t);
              });
            });
          });
        });
    });

    it('must batch multiple errors', () => {
      cy.on("uncaught:exception", (e, runnable) => {
        if (e.message.includes("This is intended for testing purposes.") || e.message.includes("Another error type.")) {
          return false;
        }
      })
      return cy.get("#many").click()
        .then(() => {
          return retry(() => {
            return getBeacons().then(beacons => {
              expectOneMatching(beacons, beacon => {
                expect(beacon.ty).to.equal('err');
                expect(beacon.e).to.match(/This is intended for testing purposes/);
                expect(beacon.c).to.equal('3');
              });

              expectOneMatching(beacons, beacon => {
                expect(beacon.ty).to.equal('err');
                expect(beacon.e).to.match(/Another error type/);
                expect(beacon.c).to.equal('1');
              });
            });
          });
        });
    });

    it('must ignore specific error messages', async () => {
      cy.on("uncaught:exception", (e, runnable) => {
        if (e.message.includes("Foo pleaseIgnoreThisError bar.") || e.message.includes("Another error type."))
          return false;
      });

      cy.get("#ignored").click();
      cy.get("#second").click();

      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons.length).to.equal(2);
        expectOneMatching(beacons, beacon => {
          expect(beacon.ty).to.equal('err');
          expect(beacon.e).to.match(/Another error type/);
          expect(beacon.c).to.equal('1');
        });
      });
    });
  });

  describe('manual reporting with error object', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('02_error/manualWithErrorObject'));
    });

    it('must support manual error reporting', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            expect(beacon.e).to.match(/Testing 123/);
            expect(beacon.st).to.be.a('string');
            expect(beacon.c).to.equal('1');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.cs).to.equal('a component stack');
            expect(beacon['m_configuration']).to.equal(JSON.stringify({
              type: 'chart',
              y1: true
            }));
          });
        });
      });
    });
  });

  describe('manual reporting with error string', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('02_error/manualWithErrorString'));
    });

    it('must support manual error reporting', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          const pageLoadBeacon = expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('pl');
          });

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            expect(beacon.e).to.equal('Failed to change route');
            expect(beacon.st).to.equal('');
            expect(beacon.c).to.equal('1');
            expect(beacon.pl).to.equal(pageLoadBeacon.t);
            expect(beacon.cs).to.equal(undefined);
          });
        });
      });
    });
  });

  describe('manual reporting with page change', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('02_error/manualWithPageChange'));
    });

    it('must support manual error reporting with page changes', () => {
      return retry(() => {
        return getBeacons().then(beacons => {
          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('err');
            expect(beacon.e).to.equal('This should have occurred on page 1');
            expect(beacon.p).to.equal('page1');
          });
        });
      });
    });
  });
});
