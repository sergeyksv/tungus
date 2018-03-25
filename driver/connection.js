/*!
 * Module dependencies.
 */

 // TODO: implement useDb

 const MongooseConnection = require('mongoose/lib/connection');
 const tingo = require('./tingodb');

 const STATES = require('mongoose/lib/connectionstate');

 const path = require('path');
 const mkdirp = require('mkdirp');

/**
 * A [TingoDB](https://github.com/sergeyksv/tingodb) 'connection' implementation.
 *
 * @inherits Connection
 * @api private
 */

function TingoConnection() {
  MongooseConnection.apply(this, arguments);
}

/*!
 * Inherits from Connection.
 */

TingoConnection.prototype.__proto__ = MongooseConnection.prototype;

/**
 * Expose the possible connection states.
 * @api public
 */

TingoConnection.STATES = STATES;

/**
 * Override the open() methods (mongoose 4.x)
 * Override the openUri() method (mongoose 4.x, 5.0)
 * @override
 */

TingoConnection.prototype._openWithoutPromise =
TingoConnection.prototype.openUri =
TingoConnection.prototype.open = function (uri, options, callback) {
  return new Promise((resolve, reject) => {
    this.uri = uri;
    const handleFunc = (err) => {
      if (err) {
        if (!callback) {
          // Error can be on same tick re: christkv/mongodb-core#157
          setImmediate(() => this.emit('error', err));
        }
        reject(err);
      }
      else {
        resolve();
        this.onOpen(callback);
      }
      callback && callback(err);
    };

    // TODO: Check if path valid on this file system
    if (!uri.startsWith('mongodb://') && !uri.startsWith('tingodb://')) {
      return handleFunc(`Uri "${uri}" is not valid!`);
    }

    let dbPath = uri.substr(10);
    mkdirp(dbPath, (err, made) => {
      if (!err) {
        this.db = new tingo.Db(dbPath, {});
      }
      handleFunc(err);
    });
  });
}

/**
 * Throws if called, as replication is not supported.
 * @override
 * @throws
 */
TingoConnection.prototype._openSetWithoutPromise =
TingoConnection.prototype.openSet = function () {
  throw new Error('The TingoDB does not support replication.');
}

/**
 * Closes the connection
 *
 * @param {Boolean} [force]
 * @param {Function} [fn]
 * @return {Connection} this
 * @api private
 */

TingoConnection.prototype.doClose = function (force, fn) {
  this.db.close(force, fn);
  return this;
}

/**
 * Not implemented yet.
 * Prepares default connection options for the TingoDB.
 *
 * _NOTE: `passed` options take precedence over connection string options._
 *
 * @param {Object} passed options that were passed directly during connection
 * @param {Object} [connStrOptions] options that were passed in the connection string
 * @api private
 */

TingoConnection.prototype.parseOptions = function () {
  // TODO: Implement me, some options might be supported by TingoDB...
  // console.info('connection.parseOptions() is not implemented yet', arguments);
  return {};
}

module.exports = TingoConnection;
