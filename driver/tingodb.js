'use strict';

module.exports = require('tingodb')(global.tingoDbOptions || {
  nativeObjectID: false,
  searchInArray: true
});
