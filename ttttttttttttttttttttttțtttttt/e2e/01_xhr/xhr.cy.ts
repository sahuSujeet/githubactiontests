/// <reference types="Cypress"/>

import { getE2ETestBaseUrl, getBeacons, deleteBeacons, getAjaxRequests, deleteAjaxRequests } from '../../../server/controls';
import { retry, expectOneMatching } from '../../../util';

describe('xhr', () => {

  afterEach(() => {
    deleteBeacons();
    deleteAjaxRequests();
  });

  describe('xhrAfterPageLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrAfterPageLoad'));
    });

    afterEach(() => {
      deleteBeacons();
    });

    it('must send beacons for XHR requests happening after page load', async () => {
      return retry(() => {
        return Promise.all([getBeacons(),getAjaxRequests()])
          .then(([beacons,ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.equal(undefined);
            });

            const ajaxBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.t).to.match(/^[0-9A-F]{1,16}$/i);
              expect(beacon.t).to.equal(beacon.s);
              expect(beacon.r).not.to.be.NaN;
              expect(beacon.ts).not.to.be.NaN;
              expect(beacon.d).not.to.be.NaN;
              expect(beacon.l).to.equal(getE2ETestBaseUrl('01_xhr/xhrAfterPageLoad'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.ph).to.equal(undefined);

              expect(beacon.t_req).to.be.a('string');
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });

    it('must report visibility state at time of request execution', async () => {
      // This test fails reproducible on IE 9, so we exclude it there. The better alternative would be to analyze this
      // thoroughly, but with IE 9 usage at 0.13% the cost/value ratio simply does not justify the effort.
      await retry(() => {
        return getBeacons()
          .then(beacons => {
            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.h).to.equal('0');
            });
          });
      });
    });
  });

  describe('xhrBeforePageLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrBeforePageLoad'));
    });

    it('must send beacons for XHR requests happening before page load', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.equal(undefined);
            });

            const ajaxBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
              expect(beacon.t).to.equal(beacon.s);
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.ph).to.equal('pl');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('xhrBeforePageLoadSynchronous', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrBeforePageLoadSynchronous'));
    });

    it('must send beacons for XHR requests happening before page load', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.equal(undefined);
            });

            const ajaxBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
              expect(beacon.t).to.equal(beacon.s);
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.ty).to.equal('xhr');
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('xhrTimeout', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrTimeout'));
    });

    it('must send error status when XHR times out', async () => {
      await retry(() => {
        return Promise.all([getBeacons()])
          .then(([beacons]) => {
            /* However, in Cypress, we typically don't need to worry about supporting multiple browsers or handling browser-specific behaviors to the same extent as in Protractor. Cypress runs only in modern Chromium-based browsers, and it doesn't support Internet Explorer or other legacy browsers. Therefore, we can safely remove this code from our Cypress tests as it's not relevant to Cypress testing.*/
            const expectedStatus = '-101';
           
            expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.match(/^[0-9A-F]{1,16}$/i);
              expect(beacon.t).to.equal(beacon.s);
              expect(beacon.st).to.equal(expectedStatus);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal('error');
            });
          });
      });
    });
  });

  describe('ignoredXhr', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/ignoredXhr'));
    });

    it('must ignore certain XHR calls', async () => {
      await retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('pl');
              expect(beacon.s).to.equal(undefined);
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
            });


            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });

            expect(ajaxRequests.length).to.equal(2);
            expect(beacons.length).to.equal(2);
          });
      });
    });
  });

  describe('xhrError', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrError'));
    });

    it('must send erroneous beacons for failed XHR requests', async () => {
      // This test fails reproducible on IE 9, so we exclude it there. The better alternative would be to analyze this
      // thoroughly, but with IE 9 usage at 0.13% the cost/value ratio simply does not justify the effort.
      await retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {
            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(0);

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon.s).to.equal(undefined);
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.t).to.match(/^[0-9A-F]{1,16}$/i);
              expect(beacon.t).to.equal(beacon.s);
              expect(beacon.r).not.to.be.NaN;
              expect(beacon.ts).not.to.be.NaN;
              expect(beacon.d).not.to.be.NaN;
              expect(beacon.l).to.equal(getE2ETestBaseUrl('01_xhr/xhrError'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^invalidprotocol:\/\/lets-cause-a-network-error-shall-we\/\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.be.oneOf(['-103', '-102']);
              expect(beacon.bc).to.equal('0');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequests.response);
            });
          });
      });
    });
  });

  describe('xhrStripSecrets', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrStripSecrets'));
    });

    it('must strip secrets from url in send beacons', async () => {
      await retry(() => {
        return Promise.all([getBeacons()])
          .then(([beacons]) => {
            expect(beacons).to.have.lengthOf(2);

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?mysecret=<redacted>&myaccountno=<redacted>&phone=999$/);
            });
          });
      });
    });
  });

  describe('xhrCaptureHeaders', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('01_xhr/xhrCaptureHeaders'));
    });

    it('must capture the http headers configured by user in xhr request', async () => {
      await retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('01_xhr/xhrCaptureHeaders'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon['h_provider']).to.equal('instana');
              expect(beacon['h_content-type']).to.equal('text/html; charset=utf-8');
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.headers['host']).to.equal('127.0.0.1:8000');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  /* In Cypress, we typically don't need to check for browser capabilities like we do in Protractor,
   as Cypress runs only in Chrome-based browsers. Therefore, we can safely remove the whenDocumentVisibilityApiIsSupported 
   function and the whenConfigMatches function, as they are not necessary in Cypress. */

  function getResultElementContent() {
    return cy.get('#result').invoke('text');
  }
});
