'use strict';

/* Requires; */
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');


/* Variables; */
var app = express();
var isDebug = app.get('env') === 'development';
app.locals.pretty = isDebug;


/* View Engine Middleware; */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


/* Middleware; */
isDebug && app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(require('node-sass-middleware')({
	src: path.join(__dirname, 'public'),
	debug: isDebug
}));


/* Static routes; */
app.use(require('./routes/routesStatic.js'));


/* Routes; */
app.use('/', require('./routes/index'));
app.use('/data', require('./routes/data'));
app.use('/api', require('./routes/api'));


/* Error Handlers; */
// 404;
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// Development error handler, will print stacktrace;
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err
		});
	});
}

// Production error handler, no stacktraces leaked to user;
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
