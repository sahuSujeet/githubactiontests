const setupBrowser = () => {
  // we are not using Angular.js
  browser.waitForAngularEnabled(false); // no need of this line because No need to disable waitForAngular in Cypress 
};

exports.restartBrowser = () => {
  browser.restartSync();
  setupBrowser();
};

exports.registerBaseHooks = () => {
  beforeEach(() => {
    setupBrowser();
  });

  afterEach(async () => {
    setupBrowser();

    // Wait until the page is disposed to ensure that we don't have any
    // more beacons that are in flight before the next test starts.
    await browser.get('about:blank');   //no need of this line because Cypress automatically handles cleaning up the page before each test 
  });
};

exports.getCapabilities = () => browser.getProcessedConfig().then(config => config.capabilities);

exports.exportCapabilities = exporter => {
  beforeEach(() => browser.getProcessedConfig().then(config => exporter(config.capabilities)));
};
 /* In Cypress, we typically don't need to check for browser capabilities like we do in Protractor,
   as Cypress runs only in Chrome-based browsers. Therefore, we can safely remove the whenDocumentVisibilityApiIsSupported 
   function and the whenConfigMatches function, as they are not necessary in Cypress. */ 
   
exports.whenConfigMatches = (predicate, fn) => {    // here predicate will be a boolean value true or false
  return browser.getProcessedConfig().then(config => {
    if (predicate(config)) {
      return fn(config);
    }
    return true;
  });
};

exports.hasResourceTimingSupport = capabilities => {
  const version = Number(capabilities.version);
  return (
    (capabilities.browserName !== 'internet explorer' && capabilities.browserName !== 'safari') ||
    (capabilities.browserName === 'internet explorer' && version >= 10)
  );
};

exports.hasPerformanceObserverSupport = capabilities => {
  console.log("capabilities",capabilities);
  // Locally no browser version is defined. We abuse this fact to only execute the performance observer
  // validations locally. Unfortunately the CI system, i.e. Saucelabs, is under too much load and therefore
  // the performance observer task queue, which is a low priority one, is not drained. This makes the
  // E2E tests highly unreliable.
  // Instead of hunting for weird test failures, we only execute these locally. To account for the lack of
  // E2E tests we have an increased number of unit tests for this feature.
  return capabilities.browserName === 'chrome' && !capabilities.version;
};
