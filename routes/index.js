'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var library = require('../controllers/library.js');

/* GET home page. */
router.get('/', function(req, res) {
	library.getAll(function(__err, __libraries) {
		res.render('index', {
			title: 'PackageSize',
			libraries: __libraries
		});
	});
});

module.exports = router;
