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
