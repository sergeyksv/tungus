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
 * Creates the TingoDB instance.
 *
 * @param {Function} fn
 * @return {Connection} this
 * @api private
 */

TingoConnection.prototype.doOpen = function (fn) {
  if (this.hosts || this.replica) {
    return this.doOpenSet(fn);
  }

  // Create DB folder, if it is not there yet..
  let dbPath = path.join(this.host || '', this.name || '');
  mkdirp.sync(dbPath);

  this.db = new tingo.Db(path.join(dbPath), {});
  fn(); // Emit all the onOpen()s

  return this;
}

TingoConnection.prototype.doOpenSet = function (fn) {
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
