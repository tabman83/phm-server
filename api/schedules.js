var routes = [{
	method: 'POST',
	path: '/schedules',
	handler: function(request, reply) {
        if(typeof(request.payload.mode) === 'undefined' || typeof(request.payload.expr) === 'undefined') {
            reply({ message: 'Missing \'mode\' and \'expr\' parameters.' }).code(500);
            return;
        }
        if(request.payload.mode !== 'turnon' && request.payload.mode !== 'turnoff') {
            reply({ message: '\'mode\' parameter must be either \'turnon\' or \'turnoff\'.' }).code(500);
            return;
        }

        //new this.CronJob('* * * * * *', this[request.payload.mode], null, true);

        var cronTime = '0 ' + request.payload.expr;
        try {
            new this.CronJob({
                cronTime: cronTime,
                onTick: this[request.payload.mode],
                start: true
            });
        } catch(ex) {
            reply({ message: 'cron pattern not valid.' }).code(500);
            return;
        }

        console.log('Scheduled', request.payload.mode, 'with', cronTime);
        reply({
            message: 'success'
        });
    }
}, {
	method: 'GET',
	path: '/schedules',
	handler: function(request, reply) {
        reply({ message: 'success' });
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
