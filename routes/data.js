'use strict';

var express = require('express');
var router = express.Router();

var Library = require('../controllers/library.js');

router.get('/:name/:version?', function(req, res, next) {
	var name = req.params.name;
	var version = req.params.version;
	var latestVersion = Library.getLatestVersionByName(name);
	const callback = function(err, library) {
		if (err) {
			console.error(err);
			next();
		} else {
			if (req.xhr) {
				res.send(library);
			} else {
				res.render('data', {
					title: name + ' | PackageSize',
					library: library,
					versions: Library.getVersionsByName(name),
					latestVersion: latestVersion,
					isLatestVersion: version === undefined || latestVersion === version,
					dump: JSON.stringify(library, null, '\t')
				});
			}
		}
	};

	if (version) {
		Library.getByVersion(name, version, callback);
	} else {
		Library.getByName(name, callback);
	}
});

module.exports = router;
