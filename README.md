# phm-server [![Build Status](https://travis-ci.org/tabman83/phm-server.svg?branch=master)](https://travis-ci.org/tabman83/phm-server)

API server and data persistence for personal-heating-manager.

## Environment variables
- MQTT_PORT (optional) changes the default port MQTT will run
- DB_HOST (optional) database host name
- DB_PORT (optional) database host port
- DB_USERNAME (optional) database username
- DB_PASSWORD (optional) database password
- ADDRESS (optional) server listening port (default is 0.0.0.0)
- PORT (optional) server listening port (default is 3000)

## Notes
Loads protobuf definitions from https://github.com/tabman83/phm-messages.git
