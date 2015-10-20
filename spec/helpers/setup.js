global.PublisherSubscriber = require('../../build/publisher-subscriber.js');

global._ = (function() {
  try {
    return require('lodash');
  } catch (_error) {
    return require('underscore');
  }
})();