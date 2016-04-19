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
        var cronTime = request.payload.cronTime;
        try {
            new this.CronJob({
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
            cronTime: cronTime
        });
        schedule.save(function (err, doc) {
            if (err) {
                cronJob.stop();
                reply({ message: err.message }).code(500);
                return;
            }
            console.log('Scheduled', request.payload.mode, 'with', cronTime, 'for timezone' + request.payload.timezone);
            reply({
                id: doc._id,
                message: 'success'
            });
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
        })
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
        reply({ message: 'success' });
    }
}];

module.exports.routes = function (server) {
	server.route(routes);
};
