'use strict';

var _ = require('lodash');
var Collection = require('./tingodb').Collection;

function TingoCollection (name, conn, opts) {
  if (undefined === opts) {
    opts = {};
  }
  if (undefined === opts.capped) {
    opts.capped = {};
  }

  opts.bufferCommands = undefined === opts.bufferCommands ? true : opts.bufferCommands;

  if ('number' === typeof opts.capped) {
    opts.capped = { size: opts.capped };
  }

  this.opts = opts;
  this.name = name;
  this.conn = conn;

  this.queue = [];
  this.buffer = this.opts.bufferCommands;

  if (conn.db){
	 this.onOpen();
  }
}

TingoCollection.prototype.addQueue = function (name, args) {
  this.queue.push([name, args]);
  return this;
};

TingoCollection.prototype.doQueue = function () {
  for (var i = 0, l = this.queue.length; i < l; i++){
    this[this.queue[i][0]].apply(this, this.queue[i][1]);
  }
  this.queue = [];
  return this;
};

TingoCollection.prototype.onOpen = function () {

  function callback (err, collection) {
    if (err) {
      self.conn.emit('error', err);
    } else {
      self.collection = collection;
	  self.buffer = false;
	  self.doQueue();
    }
  }

  var self = this;

  if (!self.opts.capped.size) {
    return self.conn.db.collection(self.name, callback);
  }

  return self.conn.db.collection(self.name, function (err, c) {
    if (err) {
      return callback(err);
    }

    c.options(function (err, exists) {
      if (err) {
        return callback(err);
      }

      if (exists) {
        if (exists.capped) {
          callback(null, c);
        } else {
          var msg = 'A non-capped collection exists with the name: ' + self.name +'\n\n' +
            ' To use this collection as a capped collection, please ' +
            'first convert it.\n' +
            ' http://www.mongodb.org/display/DOCS/Capped+Collections#CappedCollections-Convertingacollectiontocapped';
          err = new Error(msg);
          callback(err);
        }
      } else {
        // create
        var opts = _.clone(self.opts.capped);
        opts.capped = true;
        self.conn.db.createCollection(self.name, opts, callback);
      }
    });
  });

};

_.forOwn(Collection.prototype, function (value, key) {

  if (key.indexOf('_') !== 0) {

    TingoCollection.prototype[key] = function () {
      if (this.buffer) {
        this.addQueue(key, arguments);
        return;
      }

      var collection = this.collection;
      var args = arguments;

      collection[key].apply(collection, args);
    };

  }
});

TingoCollection.prototype.getIndexes = Collection.prototype.indexInformation;

module.exports = TingoCollection;
