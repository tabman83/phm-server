var schedules = require('./schedules');

exports.register = function (server) {
    schedules.routes(server);
};
