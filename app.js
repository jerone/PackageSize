'use strict';

/* Requires; */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var _ = require('underscore');
var nodalytics = require('nodalytics');
var pjson = require('./package.json');
var debug = require('debug')('packagesize:app');
var fs = require('fs');

var Library = require('./controllers/library.js');


/* Variables */
var app = express();
var isDebug = app.get('env') === 'development';
app.locals.isDebug = app.locals.pretty = app.locals.showAPI = isDebug;
app.locals.version = pjson.version;


/* View Engine Middleware */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* Middleware */
isDebug && app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(nodalytics('UA-1656712-8'));
app.use(require('node-sass-middleware')({
	src: path.join(__dirname, 'public'),
	debug: isDebug
}));


/* Static routes */
app.use(require('./routes/routesStatic.js'));


/* Routes */
app.use('/', require('./routes/index'));
app.use('/data', require('./routes/data'));
app.locals.showAPI && app.use('/api', require('./routes/api'));


/* Error Handlers */
// 404
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Development error handler, will print stacktrace.
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// Production error handler, no stacktraces leaked to user.
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


/* Server */
var OUTOFDATEINTERVAL = 1000 * 60 * 60 * 24; // One day.
const packagesJson = './data/packages.json';

// Starting server after downloading new packages.
new Promise(function(resolve, reject) {
	debug("Checking for " + packagesJson);

	if (!fs.existsSync(packagesJson)) {
		debug("File doesn't exists, let's download it");
		Library.downloadPackagesJson(resolve, reject);
	} else {
		fs.stat(packagesJson, function(err, stats) {
			if (err) {
				return console.error(err);
			}

			if (!stats) {
				debug('Can\'t check if file is out-of-date, let\'s download it again');
				Library.downloadPackagesJson(resolve, reject);
			} else {
				var mtime = stats.mtime;
				var now = new Date();
				var outdated = now - mtime > OUTOFDATEINTERVAL;
				if (outdated) {
					debug('File out-of-date at %s (%s ms)', mtime, now - mtime);
					Library.downloadPackagesJson(resolve, reject);
				} else {
					debug('File still up-to-date at %s (%s ms)', mtime, now - mtime);
					resolve();
				}
			}
		});
	}
}).then(function() {
	Library.initialize();
}).then(function() {
	debug('Starting server');

	app.set('port', process.env.PORT || 1337);

	var server = app.listen(app.get('port'), function() {
		debug('Server listening on port %o in %o mode', server.address().port, app.get('env'));
	});
});
