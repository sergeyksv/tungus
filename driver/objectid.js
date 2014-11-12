'use strict';

var ObjectId = require('./tingodb').ObjectID;

var objectIdToString = ObjectId.toString.bind(ObjectId);
module.exports = exports = ObjectId;

ObjectId.fromString = function(str){
  return new ObjectId(str);
};

ObjectId.toString = function(oid){
  if (!arguments.length) {
    return objectIdToString();
  }
  return oid.toJSON();
};

module.exports = exports = ObjectId;

