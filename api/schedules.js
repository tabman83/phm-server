var routes = [{
	method: 'POST',
	path: '/schedules',
	handler: function(request, reply) {
        if(typeof(request.payload.mode) === 'undefined' || typeof(request.payload.cronTime) === 'undefined' || typeof(request.payload.timezone) === 'undefined') {
            reply({ message: 'Missing \'mode\' and \'cronTime\' parameters.' }).code(500);
            return;
        }
        if(request.payload.mode !== 'turnon' && request.payload.mode !== 'turnoff') {
            reply({ message: '\'mode\' parameter must be either \'turnon\' or \'turnoff\'.' }).code(500);
            return;
        }

        var cronJob = null;
        var cronJobs = this.cronJobs;
        var cronTime = request.payload.cronTime;
        try {
            cronJob = new this.CronJob({
                cronTime: cronTime,
                onTick: this[request.payload.mode],
                start: true,
                timeZone: request.payload.timezone
            });
        } catch(ex) {
            reply({ message: 'cron pattern not valid.' }).code(500);
            return;
        }

        var schedule = new this.Schedule({
            mode: request.payload.mode,
            cronTime: cronTime,
            timezone: request.payload.timezone
        });
        schedule.save(function (err, doc) {
            if (err) {
                cronJob.stop();
                reply({ message: err.message }).code(500);
                return;
            }
            cronJobs.push({
                id: doc._id,
                cronJob: cronJob
            });
            console.log('Scheduled', request.payload.mode, 'with', cronTime, 'for timezone', request.payload.timezone);
            reply(doc);
        });
    }
}, {
	method: 'GET',
	path: '/schedules',
	handler: function(request, reply) {
        this.Schedule.find(function(err, docs) {
            if (err) {
                reply({ message: err.message }).code(500);
                return;
            }
            reply(docs);
        });
    }
}, {
	method: 'GET',
	path: '/schedules/{id}',
	handler: function(request, reply) {
        reply({ message: 'success' });
    }
}, {
	method: 'DELETE',
	path: '/schedules/{id}',
	handler: function(request, reply) {
        var cronJobs = this.cronJobs;
        this.Schedule.findByIdAndRemove(request.params.id, function(err, doc) {
            if (err) {
                reply({ message: err.message }).code(500);
                return;
            }
            for (var i = 0; i < cronJobs.length; i++) {
                if(cronJobs[i]._id === doc._id) {
                    cronJobs[i].stop();
                    cronJobs.splice(i, 1);
                    break;
                }
            }
            reply(doc);
        });
    }
}];

module.exports.routes = function (server) {
	server.route(routes);
};
