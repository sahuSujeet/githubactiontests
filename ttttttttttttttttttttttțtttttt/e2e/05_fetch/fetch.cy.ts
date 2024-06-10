/// <reference types='Cypress'/>
import { getE2ETestBaseUrl, getBeacons, getAjaxRequests, deleteBeacons, deleteAjaxRequests } from '../../../server/controls';
import { retry, expectOneMatching } from '../../../util';

describe('05_fetch', () => {

  afterEach(() => {
    deleteBeacons();
    deleteAjaxRequests();
  });

  describe('05_fetchAfterPageLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/afterPageLoad'));
    });

    it('must send beacons for fetch requests happening after page load', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests,]) => {

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
              expect(beacon.ts).not.to.equal('0');
              expect(beacon.d).not.to.be.NaN;
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/afterPageLoad'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
              expect(beacon.t_req).to.be.a('string');
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchNoZoneImpact', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/fetchNoZoneImpact'));
    });

    it('must not add any work to non-root Zones', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

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
              expect(beacon.ts).not.to.equal('0');
              expect(beacon.d).not.to.be.NaN;
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/fetchNoZoneImpact'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
            });

            expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal('0');
            });
          });
      });
    });
  });

  describe('05_fetchRequestObject', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/requestObject'));
    });

    it('must send beacons for fetch requests with a Request object', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

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
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObject'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('POST');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('POST');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchRequestObjectAndInitObject', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObject'));
    });

    it('must handle request and init object correctly', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

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
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObject'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('POST');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('POST');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
            });


            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchRequestObjectAndInitObjectWithoutHeaders', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObjectWithoutHeaders'));
    });

    it('must handle request and init object correctly', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

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
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/requestObjectAndInitObjectWithoutHeaders'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('POST');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('POST');
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

  describe('05_fetchBeforePageLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/beforePageLoad'));
    });

    it('must send beacons for fetch requests happening before page load', () => {
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
              expect(beacon.e).to.be.undefined;
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

  describe('05_ignoredFetch', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/ignoredFetch'));
    });

    it('must ignore certain fetch calls', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            const pageLoadBeacon = expectOneMatching(beacons, beacon => {
              expect(ajaxRequests.length).to.equal(3);
              expect(beacons.length).to.equal(2);
              expect(beacon.ty).to.equal('pl');
              expect(beacon.s).to.equal(undefined);
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.e).to.be.undefined;
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchError', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/error'));
    });

    it('must send erroneous beacons for failed fetch requests', () => {
      return retry(() => {
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
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/error'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^invalidprotocol:\/\/lets-cause-a-network-error-shall-we\/\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('-103');
              expect(beacon.bc).to.equal('0');
              expect(beacon.e).to.be.oneOf([
                // Chrome says:
                'Failed to fetch',
                // IE says:
                'NetworkError when attempting to fetch resource.',
                // Safari 11.1 complains about CORS (because it is an absolute URL) before even attempting to do
                // the network request:
                'Cross origin requests are only supported for HTTP.',
                // Safari 10.1 and 11.0 say:
                'Type error',
                // MS Edge 14.x says:
                'TypeMismatchError'
              ]);
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal('catched an error');
            });
          });
      });
    });
  });

  describe('05_withPolyfill', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/withPolyfill'));
    });

    it('must send only send beacons once, not for fetch and XHR', () => {
      // Note: No whenFetchIsSupported here, this must work in all browsers
      // that support XHR instrumentation.
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

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
              expect(beacon.l).to.equal(getE2ETestBaseUrl('05_fetch/withPolyfill'));
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.pl).to.equal(pageLoadBeacon.t);
              expect(beacon.m).to.equal('GET');
              expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon.a).to.equal('1');
              expect(beacon.st).to.equal('200');
              expect(beacon.bc).to.equal('1');
              expect(beacon.e).to.be.undefined;
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['x-instana-t']).to.equal(ajaxBeacon.t);
              expect(ajaxRequest.headers['x-instana-s']).to.equal(ajaxBeacon.s);
              expect(ajaxRequest.headers['x-instana-l']).to.equal('1,correlationType=web;correlationId=' + ajaxBeacon.t);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_graphql_apollo', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/graphql_apollo'));
    });

    it('must instrument Apollo GraphQL HTTP calls', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons]) => {

            expect(beacons).to.have.lengthOf(6);

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.gon).to.equal('Book');
              expect(beacon.got).to.equal('query');
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.gon).to.equal('Books');
              expect(beacon.got).to.equal('query');
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.gon).to.equal(undefined);
              expect(beacon.got).to.equal('query');
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.gon).to.equal('Borrow');
              expect(beacon.got).to.equal('mutation');
            });

            expectOneMatching(beacons, beacon => {
              expect(beacon.ty).to.equal('xhr');
              expect(beacon.gon).to.equal(undefined);
              expect(beacon.got).to.equal('mutation');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal('Done!');
            });
          });
      });
    });
  });

  describe('05_fetchStripScerets', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/fetchStripSecrets'));
    });

    it('must strip secrets from url in send beacons', () => {
      return retry(() => {
        return Promise.all([getBeacons()]).then(([beacons]) => {

          expect(beacons).to.have.lengthOf(2);

          expectOneMatching(beacons, beacon => {
            expect(beacon.ty).to.equal('xhr');
            expect(beacon.u).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?mysecret=<redacted>&myaccountno=<redacted>&phone=999$/);
          });
        });
      });
    });
  });

  describe('05_fetchCaptureHeaders', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/captureHeaders'));
    });

    it('must capture headers in fetch requests', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/captureHeaders'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax\?cacheBust=\d+$/);
              expect(beacon['h_content-type']).to.equal('text/html; charset=utf-8');
              expect(beacon['h_from']).to.equal('stan@instana.com');

              expect(beacon.t_req).to.be.a('string');
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.url).to.match(/^\/ajax\?cacheBust=\d+$/);
              expect(ajaxRequest.headers['from']).to.equal('stan@instana.com');
              expect(ajaxRequest.headers['host']).to.equal('127.0.0.1:8000');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchWithFormData', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/fetchWithFormData'));
    });

    it('must send form data in fetch requests', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithFormData'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['m']).to.equal('POST');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/form+$/);
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.url).to.match(/^\/form+$/);
              expect(ajaxRequest.headers['content-type']).to.contains('multipart/form-data;');
              expect(ajaxRequest.fields['name']).to.contains('somename');
              expect(ajaxRequest.fields['data']).to.contains('somedata');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchWithRequestObjectAndFormData', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/fetchWithRequestObjectAndFormData'));
    });

    it('must send form data in fetch requests', () => {
      return retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(2);
            expect(ajaxRequests).to.have.lengthOf(1);

            expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithRequestObjectAndFormData'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['m']).to.equal('POST');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/form+$/);
            });

            const ajaxRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.url).to.match(/^\/form+$/);
              expect(ajaxRequest.headers['content-type']).to.contains('multipart/form-data;');
              expect(ajaxRequest.fields['name']).to.contains('somename');
              expect(ajaxRequest.fields['data']).to.contains('somedata');
            });

            getResultElementContent().then((result) => {
              expect(result).to.equal(ajaxRequest.response);
            });
          });
      });
    });
  });

  describe('05_fetchWithCsrfToken', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
    });

    it('must send csrf token in fetch requests', async () => {
      await retry(() => {
        return Promise.all([getBeacons(), getAjaxRequests()])
          .then(([beacons, ajaxRequests]) => {

            expect(beacons).to.have.lengthOf(7);
            expect(ajaxRequests).to.have.lengthOf(6);

            const ajaxGetBeacon = expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['m']).to.equal('GET');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
              expect(beacon['h_test-header']).to.equal('a');
            });

            const ajaxGetRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.url).to.match(/^\/ajax+$/);
              expect(ajaxRequest.method).to.equal('GET');
              //original header is passed through
              expect(ajaxRequest.headers['test-header']).to.equal('a');
            });

            const ajaxPostRequest = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.url).to.match(/^\/ajax+$/);
              expect(ajaxRequest.method).to.equal('POST');
              expect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
              //original header is untouched.
              expect(ajaxRequest.headers['test-header']).to.equal('a');
            });

            expect(ajaxGetRequest.headers['x-instana-t']).to.equal(ajaxGetBeacon.t);
            //instana correltion header is not attached to original headers.
            expect(ajaxPostRequest.headers['x-instana-t']).to.not.contains(ajaxGetBeacon.t);

            const ajaxGetBeacon2 = expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['m']).to.equal('GET');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
              expect(beacon['h_test-header']).to.equal('b');
            });

            const ajaxGetRequest2 = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              //original header is passed through
              expect(ajaxRequest.headers['test-header']).to.equal('b');
            });

            const ajaxPostRequest2 = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('POST');
              expect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
              //original header is untouched.
              expect(ajaxRequest.headers['test-header']).to.equal('b');
            });

            expect(ajaxGetRequest2.headers['x-instana-t']).to.equal(ajaxGetBeacon2.t);
            //instana correltion header is not attached to original headers.
            expect(ajaxPostRequest2.headers['x-instana-t']).to.not.contains(ajaxGetBeacon2.t);

            const ajaxGetBeacon3 = expectOneMatching(beacons, beacon => {
              expect(beacon['l']).to.equal(getE2ETestBaseUrl('05_fetch/fetchWithCsrfToken'));
              expect(beacon['ty']).to.equal('xhr');
              expect(beacon['m']).to.equal('GET');
              expect(beacon['u']).to.match(/^http:\/\/127\.0\.0\.1:8000\/ajax+$/);
              expect(beacon['h_test-header']).to.equal('c');
            });

            const ajaxGetRequest3 = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('GET');
              //original header is passed through
              expect(ajaxRequest.headers['test-header']).to.equal('c');
            });

            const ajaxPostRequest3 = expectOneMatching(ajaxRequests, ajaxRequest => {
              expect(ajaxRequest.method).to.equal('POST');
              expect(ajaxRequest.headers['x-csrf-token']).to.equal('this-is-a-csrf-token');
              //original header is untouched.
              expect(ajaxRequest.headers['test-header']).to.equal('c');
            });

            expect(ajaxGetRequest3.headers['x-instana-t']).to.equal(ajaxGetBeacon3.t);
            //instana correltion header is not attached to original headers.
            expect(ajaxPostRequest3.headers['x-instana-t']).to.not.contains(ajaxGetBeacon3.t);
          });
      });
    });
  });

  function getResultElementContent() {
    return cy.get('#result').invoke('text');
  }
});
