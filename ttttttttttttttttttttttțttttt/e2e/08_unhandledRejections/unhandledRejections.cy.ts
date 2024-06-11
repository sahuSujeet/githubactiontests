import { getE2ETestBaseUrl, getBeacons, deleteBeacons } from '../../../server/controls';
import { retry, expectOneMatching } from '../../../util';

describe('08_unhandledRejections', () => {
  
  beforeEach(() => {
    cy.visit(getE2ETestBaseUrl('08_unhandledRejections/unhandledRejection'));
  });

  afterEach(()=>{
    deleteBeacons();
  });

  it('must send error beacon for unhandled rejection', async () => {
    cy.on('uncaught:exception', (e, runnable) => {
      if (e.message.includes('Unrejected on purpose.'))
        return false;
    });

    cy.get('#clickError').click();
    await retry(async () => {
      const beacons = await getBeacons();
      expect(beacons.filter(b => b.ty === 'err').length).to.equal(1);
      expectOneMatching(beacons, beacon => {
        expect(beacon.ty).to.equal('err');
        expect(beacon.e).to.contain('Unrejected on purpose');
      });
    });
    cy.get('#output').invoke('text').then((text) => {
      expect(text).to.equal('Custom unhandledrejection listener called.');
    });
  });

});
