/*!
 * Module exports.
 */

exports.Binary = require('./binary');
exports.ObjectId = require('bson').ObjectId; // TODO: Make non native object id work, optionally

// Dummy
exports.Decimal128 = require('bson').Decimal128;
exports.ReadPreference = () => { throw new Error('The TingoDB does not support replication.'); };
