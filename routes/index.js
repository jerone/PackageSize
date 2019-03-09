'use strict';

var express = require('express');
var router = express.Router();
var _ = require('underscore');

var Library = require('../controllers/library.js');

/* GET home page. */
router.get('/', function(req, res) {
	if (req.query.keyword) {
		Library.getAllByKeyword(req.query.keyword, function(err, libraries) {
			res.render('index', {
				title: 'PackageSize',
				libraries: libraries,
				topKeywords: Library.getTopKeywords(),
				keywords: Library.getKeywords(),
				currentKeyword: Library.getNormalizedKeyword(req.query.keyword)
			});
		});
	} else {
		Library.getAll(function(err, libraries) {
			res.render('index', {
				title: 'PackageSize',
				libraries: libraries,
				topKeywords: Library.getTopKeywords(),
				keywords: Library.getKeywords()
			});
		});
	}
});

module.exports = router;
