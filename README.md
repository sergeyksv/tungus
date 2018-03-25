Tungus
======

[![Build Status](https://travis-ci.org/sergeyksv/tungus.png?branch=master)](https://travis-ci.org/sergeyksv/tungus)

__Note! This version of the driver atm only works with Mongoose 4.x and 5.0. It might not be backwards compatible with Tungus 0.0.x databases, as it uses native ObjectIDs by default.__

This module implements mongoose.js driver API and allows to use mongoose with [TingoDB](http://www.tingodb.com).

TingoDB is embedded Node.js database that is compatible with MongoDB on API level.

So far this module supports the most features of mongoose, but not all are tested yet.

It provides all features, that are supported by the embeddable TingoDB. _**PRs are welcome!**_

To use this module you have to install both tungus and mongoose.

	npm install tungus
	npm install mongoose

All it needs is to include the Tungus module once before mongoose is included.
This rewrites ```global.MONGOOSE_DRIVER_PATH``` variable to point it to tungus.

```javascript
require('tungus');
require('mongoose');
```

You can now use the TingoDB as a drop-in replacement for the MongoDB:

```javascript
mongoose.connect('mongodb://localhost/big_project-dev');
/* or to prevent backwards compatibility, replace the protocol */
/* this throws errors, if tungus is not present */
mongoose.connect('tingodb://some/local/folder');
/* you can even use a global folder (here on windows) */
mongoose.connect('tingodb://C:\\data\\in\\a\\global\\path');
```

Optionally you can set tingodb options using ```TUNGUS_DB_OPTIONS``` global variable. For example this way it is possible to switch to TingoDBs simple ObjectIds which is not tested at the moment.

```javascript
/* Current defaults */
global.TUNGUS_DB_OPTIONS = { nativeObjectID: true, searchInArray: true };
```

Full example:
```javascript
const tungus = require('tungus');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

console.info('Running mongoose version %s', mongoose.version);

/**
 * Console schema and model
 */

const consoleSchema = Schema({
  name: String,
  manufacturer: String,
  released: Date
});
const Console = mongoose.model('Console', consoleSchema);

/**
 * Game schema and model
 */

const gameSchema = Schema({
  name: String,
  developer: String,
  released: Date,
  consoles: [{ type: Schema.Types.ObjectId, ref: 'Console' }]
});
const Game = mongoose.model('Game', gameSchema);

/**
 * Connect to the local tingo db file (NOT using MongoClient)
 */

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://data/base`, { useMongoClient: false })
  // Create data (console)
  .then(() => Console.create({
    name: 'Nintendo 64',
    manufacturer: 'Nintendo',
    released: 'September 29, 1996'
  }))
  // Create data (game)
  .then((nintendo64) => Game.create({
    name: 'Legend of Zelda: Ocarina of Time',
    developer: 'Nintendo',
    released: new Date('November 21, 1998'),
    consoles: [nintendo64]
  }))
  // Run example
  .then(example)
  // Something bad happened!
  .catch((err) => console.error('Example failed!', err));

/**
 * Example: Population
 */

function example () {
  return Game
    .findOne({ name: /^Legend of Zelda/ })
    .populate('consoles')
    .then((ocarina) => {
      console.log(ocarina);
      console.log(
        '"%s" was released for the %s on %s',
        ocarina.name,
        ocarina.consoles[0].name,
        ocarina.released.toLocaleDateString()
      );
    })
    .then(cleanup);
}

/**
 * Remove elements and disconnect
 */

function cleanup () {
  return Promise.resolve()
    .then(() => Console.remove({}))
    .then(() => Game.remove({}))
    .then(() => mongoose.disconnect());
}
```
