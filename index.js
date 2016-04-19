var mongoose = require('mongoose');
var CronJob = require('cron').CronJob;
var Hapi = require('hapi');
var api = require('./api');

var dbUrl = 'mongodb://' + (process.env.DB_HOST || 'localhost') + ':' + (process.env.DB_PORT || '27017') + '/personal-heating-manager';
var server = null;
var cronJobs = [];

var turnon = function(job, done) {
	console.log('Turning ON at', new Date());
}

var turnoff = function(job, done) {
	console.log('Turning OFF at', new Date());
}

var serverStarted = function(err) {
	if(err) {
		console.error('Failed to start server: ' + err.message);
		gracefulExit();
		return;
	}
	console.log('Server listening at ' + (process.env.ADDRESS || '0.0.0.0') + ':' + (process.env.PORT || 3000));
}

mongoose.connection.on('connected', function() {
	console.log("Connected to " + dbUrl + ' db!');
	server = new Hapi.Server();
	server.connection({
		address: process.env.ADDRESS || '0.0.0.0',
		port: process.env.PORT || 3000,
		routes: {
            cors: true
        }
	});
	server.bind({
		mongoose: mongoose,
		CronJob: CronJob,
		turnon: turnon,
		turnoff: turnoff,
		Schedule: Schedule,
		cronJobs: cronJobs
	});
	api.register(server);
	server.start(serverStarted);
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


var Schedule = mongoose.model('Schedule', {
	mode: {
		type: String,
		required: true,
		enum: ['turnon', 'turnoff']
	},
	cronTime: {
		type: String,
		required: true
	},
	timezone: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now,
		index: true,
		required: true
	}
});

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
