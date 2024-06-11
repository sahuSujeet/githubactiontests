/* eslint-env node */

const Promise = require('bluebird');

/**The util.retry() function retries the provided function (fn) until it succeeds or the specified time limit (time) is exceeded. If the time limit is exceeded (until), it executes the function without retrying. */
exports.retry = function retry(fn, time, until) {    // here time and until are the optioanl parameters 
  if (time == null) {
    time = exports.getTestTimeout() / 2;        // time can be 15000 or 10000
  }

  if (until == null) {           // Date.now() returns the number of milliseconds since January 1, 1970 00:00:00 UTC:
    until = Date.now() + time;   // until = 1710087731215 + 15000 or 10000                       
  }

  if (Date.now() > until) {      //false
    return fn();
  }
  
  return Promise.delay(time / 20) // The Promise.delay() function is used to create a promise that resolves after a delay of time / 20 milliseconds.
    .then(fn)
    .catch(function() {
      return retry(fn, time, until);
    });
};


exports.expectOneMatching = function expectOneMatching(arr, fn) {
  if (!arr || arr.length === 0) {
    throw new Error('Could not find an item which matches all the criteria. Got 0 items.');
  }

  var error;
  
  for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    try {
      fn(item);
      return item;
    } catch (e) {
        error = e;
    }
  }

  if (error) {
    throw new Error('Could not find an item which matches all the criteria. Got ' + arr.length +
      ' items. Last error: ' + error.message + '. All Items:\n' + JSON.stringify(arr, 0, 2) +
      '. Error stack trace: ' + error.stack);
  }
};


exports.getTestTimeout = function() {
  if (process.env.CI) {
    return 30000;
  }
  return 20000;
};


