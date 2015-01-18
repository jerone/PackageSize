var express = require('express');
var router = express.Router();

var Library = require('../controllers/library.js');

router.get('/:name/:version?', function(req, res) {
	var name = req.params.name;
	var version = req.params.version;
	var callback = function(err, library) {
		if (err) {
			console.log(err);
		} else {
			if (req.xhr) {
				res.send(library);
			} else {
				res.render('data', {
					title: name + ' | PackageSize',
					library: library,
					versions: Library.getVersionsByName(name),
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
