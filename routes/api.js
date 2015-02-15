'use strict';

var express = require('express');
var router = express.Router();

var Library = require('../controllers/library.js');

router.get('/:name/:version?', function(req, res) {
	var name = req.params.name;
	var version = req.params.version;
	var versions = Library.getVersionsByName(name);
	var callback = function(__err, __library) {
		res.send(__library);
	};

	if (version) {
		Library.getByVersion(name, version, callback);
	} else {
		Library.getByName(name, callback);
	}
});

module.exports = router;
