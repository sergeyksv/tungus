Tungus
======

[![Build Status](https://travis-ci.org/sergeyksv/tungus.png?branch=master)](https://travis-ci.org/sergeyksv/tungus)
[![Deps Status](https://david-dm.org/sergeyksv/tungus.png)](https://david-dm.org/sergeyksv/tungus)
[![Dev deps Status](https://david-dm.org/sergeyksv/tungus/dev-status.png)](https://david-dm.org/sergeyksv/tungus)

This module implements mongoose.js driver API and allows to use mongoose with [TingoDB](http://www.tingodb.com).

TingoDB is embedded Node.js database that is compatible with MongoDB on API level.

So far this module is on its early stage with only basic functionality.

To use this module you have to install both tungus and mongoose.

	npm install tungus
	npm install mongoose

Then in your code you should include once tungus module prior to include of mongoose.
This rewrites global.MONGOOSE_DRIVER_PATH variable to point it to tungus.

	require('tungus')
	require('mongoose')

Next to that you can keep using mongoose as usual except now it will accept different connection string:

	mongoose.connect('tingodb:///some/local/folder')
	
Optionally you can set tingodb options using ```TUNGUS_DB_OPTIONS``` global variable. For example this way it is possible to switch to BSON.ObjectID ids which is default for mongodb.

```
global.TUNGUS_DB_OPTIONS =  { nativeObjectID: true, searchInArray: true };
```

Full example:

	var tungus = require('tungus');
	var mongoose = require('mongoose')
	var Schema = mongoose.Schema;

	console.log('Running mongoose version %s', mongoose.version);

	/**
	 * Console schema
	 */

	var consoleSchema = Schema({
		name: String
	  , manufacturer: String
	  , released: Date
	})
	var Console = mongoose.model('Console', consoleSchema);

	/**
	 * Game schema
	 */

	var gameSchema = Schema({
		name: String
	  , developer: String
	  , released: Date
	  , consoles: [{ type: Schema.Types.ObjectId, ref: 'Console' }]
	})
	var Game = mongoose.model('Game', gameSchema);

	/**
	 * Connect to the local tingo db file
	 */

	mongoose.connect('tingodb://'+__dirname+'/data', function (err) {
	  // if we failed to connect, abort
	  if (err) throw err;

	  // we connected ok
	  createData();
	})

	/**
	 * Data generation
	 */

	function createData () {
	  Console.create({
		  name: 'Nintendo 64'
		, manufacturer: 'Nintendo'
		, released: 'September 29, 1996'
	  }, function (err, nintendo64) {
		if (err) return done(err);

		Game.create({
			name: 'Legend of Zelda: Ocarina of Time'
		  , developer: 'Nintendo'
		  , released: new Date('November 21, 1998')
		  , consoles: [nintendo64]
		}, function (err) {
		  if (err) return done(err);
		  example();
		})
	  })
	}

	/**
	 * Population
	 */

	function example () {
	  Game
	  .findOne({ name: /^Legend of Zelda/ })
	  .populate('consoles')
	  .exec(function (err, ocinara) {
		if (err) return done(err);
		console.log(ocinara);

		console.log(
			'"%s" was released for the %s on %s'
		  , ocinara.name
		  , ocinara.consoles[0].name
		  , ocinara.released.toLocaleDateString());

		done();
	  })
	}

	function done (err) {
	  if (err) console.error(err);
	  Console.remove(function () {
		Game.remove(function () {
		  mongoose.disconnect();
		})
	  })
	}

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/sergeyksv/tungus/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![githalytics.com alpha](https://cruel-carlota.pagodabox.com/b6cbaf6c8ba3c422361664a9df97ec80 "githalytics.com")](http://githalytics.com/sergeyksv/tungus)
