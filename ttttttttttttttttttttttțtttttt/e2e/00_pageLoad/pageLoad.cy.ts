/// <reference types="Cypress"/>
import {getE2ETestBaseUrl, getBeacons, deleteBeacons} from '../../../server/controls';
import { retry }  from '../../../util';



describe('pageLoad', () => {
  
  let start;

  beforeEach(() => {
    start = Date.now();
  });

  afterEach(() => {
    deleteBeacons();
  });

  describe('pageLoad', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/pageLoad'));
    });

    it('must include basic page load information', async () => {
      await retry(async () => {
        const [beacon] = await getBeacons();
        expect(beacon.t).to.match(/[0-9a-f]{1,16}/i);

        // We cannot compare with start time due to saucelabs platforms not having
        // NTP properly configured…
        expect(beacon.r.length).to.be.at.least(String(start).length);
        expect(beacon.ts.length).to.be.below(6);
        expect(beacon.d.length).to.be.below(6);
        expect(beacon.ty).to.equal('pl');
        expect(beacon.k).to.equal(undefined);
        expect(beacon.p).to.equal(undefined);
        expect(beacon.u).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoad'));
        expect(beacon.ph).to.equal('pl');
        expect(beacon.sv).to.equal('2');

        expect(beacon.ww).to.match(/^\d+$/);
        expect(beacon.wh).to.match(/^\d+$/);

        expect(beacon.ul).to.be.a('string');
        expect(beacon.ul.split(',').length).to.be.at.least(1);
      });
    });
  });

  describe('meta', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/meta'));
    });

    it('must send simple meta data information', () => {
      return retry(() => {
        return getBeacons()
          .then(beacons => {
            expect(beacons.length).to.equal(1);

            const [beacon] = beacons;
            expect(beacon['m_foo']).to.equal('bar');
            expect(beacon['m_a']).to.equal('true');
            expect(beacon['m_b']).to.equal('false');
            expect(beacon['m_c']).to.equal('42');
            expect(beacon['m_d'].startsWith('42.')).to.equal(true);
            expect(beacon['m_e']).to.equal('null');
            expect(beacon['m_f']).to.equal('undefined');
            expect(beacon['m_g']).to.equal('[1,2,3]');
            expect(beacon['m_h']).to.equal('{"a":true,"b":"42"}');
            expect(beacon['m_circularMeta']).to.equal(undefined);
            expect(beacon['ui']).to.equal('321');
            expect(beacon['un']).to.equal('Tom Anderson');
            expect(beacon['ue']).to.equal('tom.anderson@example.com');
            expect(beacon['sid']).to.be.a('string');
          });
      });
    });
  });

  describe('tooMuchMeta', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/tooMuchMeta'));
    });

    it('must restrict the number of meta data entries', () => {
      return retry(() => {
        return getBeacons()
          .then(beacons => {
            expect(beacons.length).to.equal(1);

            const [beacon] = beacons;

            expect(Object
              .keys(beacon)
              .filter(k => k.startsWith('m_'))
              .length).to.equal(25);
            expect(beacon['m_longValue']).to.match(/^a{1024,1024}$/);
          });
      });
    });
  });

  describe('customPage', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/customPage'));
    });

    it('must send user configured page', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['p']).to.equal('myPage');
          });
      });
    });
  });

  describe('multiComplicatedMeta', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/multiComplicatedMeta'));
    });

    it('must send complicated meta data information', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['m_user']).to.equal('tom.mason@example.com');
            expect(beacon['m_No&way']).to.equal('Ifyou\nHaveTo&DoThis');
          });
      });
    });
  });

  describe('apiKey', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/apiKey'));
    });

    it('must send user provided API key', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => expect(beacon.k).to.equal('myFancyApiKey'));
      });
    });
  });

  describe('apiKeyViaKey', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/apiKeyViaKey'));
    });

    it('must send user provided API key', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => expect(beacon.k).to.equal('myFancyApiKey'));
      });
    });
  });

  describe('backendTraceId', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/backendTraceId'));
    });

    it('must send user provided backend trace ID', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => expect(beacon.bt).to.equal('someBackendTraceId'));
      });
    });
  });

  describe('ignoredWindowLocation', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/ignoredWindowLocation'));
    });

    it('must not send any data', async () => {
      await retry(async () => {
        const beacons = await getBeacons();
        expect(beacons.length).to.equal(0);
      });
    });
  });

  describe('navigationTimings', () => {

    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/navigationTimings'));
    });

    afterEach(()=>{
      deleteBeacons();
    });

    it('must send navigation timings', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            testIsPositiveInteger(beacon.t_unl);
            testIsPositiveInteger(beacon.t_red);
            testIsPositiveInteger(beacon.t_apc);
            testIsPositiveInteger(beacon.t_dns);
            testIsPositiveInteger(beacon.t_tcp);
            testIsPositiveInteger(beacon.t_req);
            testIsPositiveInteger(beacon.t_rsp);
            testIsPositiveInteger(beacon.t_dom);
            testIsPositiveInteger(beacon.t_chi);
            testIsPositiveInteger(beacon.t_ttfb);
          });
      });
    });

    it('must send either no first paint time or a time > 0', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            // ensure that we have a beacon with some data
            testIsPositiveInteger(beacon.t_dom);

            if (beacon.t_fp !== undefined) {
              testIsPositiveInteger(beacon.t_fp, 1);
            }
          });
      });
    });

    function testIsPositiveInteger(s, minInclusive = 0) {
      expect(s).to.match(/^\d+$/);
      expect(parseInt(s, 10)).to.be.at.least(minInclusive);
    }

    function hasNavigationTimingSupport(capabilities) {
      const version = Number(capabilities.version);
      return capabilities.browserName !== 'internet explorer' || version >= 9;
    }
  });

  describe('resourceTimings', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/resourceTimings'));
    });

    it('must send resource timing data', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            const timings = typeof beacon.res === 'string' ? JSON.parse(beacon.res) : beacon.res;
            stripTimingValues(timings);
            expect(timings).to.deep.equal({
              http: {
                's://': {
                  'maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap': {
                    '.min.css': [true],
                    '-theme.min.css': [true]
                  },
                  'cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.js': [true]
                },
                '://127.0.0.1:8000/': {
                  'e2e/initializer.js': [true],
                  'target/eum.min.js': [true]
                }
              }
            }, `Got the following timing: ${JSON.stringify(timings, null, 2)}.`);
          });
      });
    });
  });

  describe('ignoredResources', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/ignoredResources'));
    });

    it('must send resource timing data', async() => {
      await retry(async () => {
        const beacons = await getBeacons();
        const timings = typeof beacons[0].res === 'string' ? JSON.parse(beacons[0].res) : beacons[0].res;
        stripTimingValues(timings);
        expect(timings).to.deep.equal({
          http: {
            's://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.js': [true],
            '://127.0.0.1:8000/': {
              'e2e/initializer.js': [true],
              'target/eum.min.js': [true]
            }
          }
        }, `Got the following timing: ${JSON.stringify(timings, null, 2)}.`); // JSON.stringify Spacing Argument:
        //Changed JSON.stringify(timings, 0, 2) to JSON.stringify(timings, null, 2).
        //The second argument should be null when not using a replacer function, and the third argument specifies the number of spaces for indentation, which is correctly 2.
      });
    });
  });

  describe('stripSecrets', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&account=myaccount&appsecret=password&phoneno=119');
    });

    it('must strip secret from url', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&account=<redacted>&appsecret=<redacted>&phoneno=119');
            expect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('stripSecretlastQueryParam', () => {   
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&phoneno=119&account=myaccount#fragmentinfo');
    });

    it('must strip secret from url when it is last query parameter', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadStripSecrets') + '&phoneno=119&account=<redacted>#fragmentinfo');
            expect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('redactFragment', () => {     
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=password&phoneno=119#fragmentstring');
    });
    it('must redact fragment from url', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=<redacted>&phoneno=119#<redacted>');
            expect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('redactFragmentLastQp', () => {   
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=password#fragmentstring');
    });

    it('must strip secret from url for last query parameter and redact fragment', () => {
      return retry(() => {
        return getBeacons()
          .then(([beacon]) => {
            expect(beacon['u']).to.equal(getE2ETestBaseUrl('00_pageLoad/pageLoadRedactFragment') + '&account=myaccount&appsecret=<redacted>#<redacted>');
            expect(beacon['l']).to.equal(beacon['u']);
          });
      });
    });
  });

  describe('resourceStripSecrets', () => {
    beforeEach(() => {
      cy.visit(getE2ETestBaseUrl('00_pageLoad/resourceStripSecrets'));
    });

    it('must send resource timing data with secrets striped', () => {
      return retry(() => {
        return getBeacons().then(([beacon]) => {
          const timings = typeof beacon.res === 'string' ? JSON.parse(beacon.res) : beacon.res;
          stripTimingValues(timings);
          expect(timings.http).to.have.property( 's://fonts.googleapis.com/css?family=<redacted>' );
        });
      });
    });
  });
});

function stripTimingValues(node) {
  if (node instanceof Array) {
    node.forEach((entry, i) => node[i] = true);
    return;
  }

  Object.keys(node).forEach(key => stripTimingValues(node[key]));
}


