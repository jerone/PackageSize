'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var Library = require('../controllers/library.js');

/* GET home page. */
router.get('/', function(req, res) {
	if (req.query.keyword) {
		Library.getAllByKeyword(req.query.keyword, function(__err, __libraries) {
			res.render('index', {
				title: 'PackageSize',
				libraries: __libraries,
				topKeywords: Library.getTopKeywords(),
				keywords: Library.getKeywords(),
				currentKeyword: req.query.keyword
			});
		});
	} else {
		Library.getAll(function(__err, __libraries) {
			res.render('index', {
				title: 'PackageSize',
				libraries: __libraries,
				topKeywords: Library.getTopKeywords(),
				keywords: Library.getKeywords()
			});
		});
	}
});

module.exports = router;
