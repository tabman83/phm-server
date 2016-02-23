var mongoose = require('mongoose');

var dbUrl = 'mongodb://' + (process.env.DB_HOST || 'localhost') + ':' + (process.env.DB_PORT || '27017') + '/personal-heating-manager';

mongoose.connection.on('connected', function() {
	console.log("Connected to " + dbUrl + ' db!');
});

mongoose.connection.on('error', function(err) {
	console.error('Failed to connect to db on startup: ' + err.message);
	gracefulExit();
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
	console.log('Mongoose default connection to db disconnected.');
});

var gracefulExit = function() { 
	mongoose.connection.close(function () {
		console.log('Mongoose default connection to db is disconnected through app termination.');
		process.exit(0);
	});
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);
  
try {
	mongoose.connect(dbUrl, {
		user: process.env.DB_USERNAME || null,
		pass: process.env.DB_PASSWORD || null,
		server: {
			socketOptions: { 
				keepAlive: 120
			}
		},
		replset: {
			socketOptions: { 
				keepAlive: 120
			}
		}
	});
	console.log('Trying to connect to db ' + dbUrl);
} catch (err) {
	console.log('Server initialization failed: ' + err.message);
}

var Sensor = mongoose.model('Sensor', {
	device: { 
		type: String,
		required: true,
		index: true
	},
	type: {
		type: String,
		required: true,
		index: true
	},
	value: {
		type: Number,
		required: true
	},
	createdAt: { 
		type: Date,
		default: Date.now,
		index: true,
		required: true
	}
});