'use strict';

module.exports = require('tingodb')(global.TUNGUS_DB_OPTIONS || {
  nativeObjectID: false,
  searchInArray: true
});
