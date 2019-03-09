'use strict';

var async = require('async');
var debug = require('debug')('packagesize:library');
var path = require('path');
var fs = require('fs');
var request = require('request');
var progress = require('request-progress');

var _ = require('../helpers/underscore.js');
var getSize = require('../helpers/size.js').getSize;

var OUTOFDATEINTERVAL = 1000 * 60 * 60 * 24; // One day;
var SIMILAR = {
	'angularjs': ['angular', 'angular.js'],
	'angular-ui': ['angularui'],
	'javascript': ['js'],
	'charts': ['chart', 'charting', 'chartlist'],
	'directive': ['directives'],
	'ember.js': ['ember'],
	'opal.js': ['opal'],
	'aurora.js': ['aurora'],
	'jquery-ui': ['jqueryui', 'jquery ui'],
	'bootstrap': ['twitter-bootstrap', 'boostrap'],
	'data-binding': ['data binding'],
	'data-visualization': ['data visualization'],
	'datagrid': ['data grid'],
	'lazy-load': ['lazy load', 'lazyload'],
	'material design': ['material-design'],
	'scrolltotop': ['scroll to top'],
	'time-series': ['time series'],
	'user-interface': ['user interface'],
	'web-components': ['web components'],
	'web-font': ['web font', 'webfont']
};


var packages = {};
module.exports.initialize = function() {
	debug('Start initializing packages');

	var x = require(path.join(__dirname, '..', 'data', 'packages.json'));
	packages = x.packages;

	debug('Packages successfully initialized');
};
var packageSizeJSON = path.join(__dirname, '..', 'data', 'packagessize.json');

var url = "http://cdnjs.com/packages.json";
const packagesJson = './data/packages.json';

module.exports.downloadPackagesJson = function(resolve, reject) {
	debug("Downloading %s", url);

	progress(request(url))
		.on('progress',
			function(state) {
				debug('Download progress %j', state);
			})
		.on('error',
			function(err) {
				console.error('Error while downloading ' + url, err);
				return reject();
			})
		.on('end',
			function() {
				debug("Finished downloading " + url);
				resolve();
			})
		.pipe(fs.createWriteStream(packagesJson));
};


function createUrl(name, version, file) {
	return 'http://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + file;
	// https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources
}


module.exports.getAll = function getAll(callback) {
	debug('getAll()', !!packages);

	var libraries = _.map(packages, function(__package) {
		return {
			name: __package.name,
			version: __package.version,
			description: __package.description,
			keywords: __package.keywords || []
		};
	});
	callback(null, libraries);
};

function getNormalizedKeyword(keyword) {
	if (_.has(SIMILAR, keyword)) {
		return keyword;
	}

	return _.findKey(SIMILAR, function(value) {
		return value.indexOf(keyword) > -1;
	}) || keyword;
}
module.exports.getNormalizedKeyword = getNormalizedKeyword;


module.exports.getAllByKeyword = function getAllByKeyword(keyword, callback) {
	debug('getAllByKeyword(%o)', keyword);

	keyword = getNormalizedKeyword(keyword.toLowerCase());
	var similar = SIMILAR[keyword] || [];
	similar.push(keyword);

	var libraries = _.map(_.filter(packages, function(__package) {
		return _.some(__package.keywords, function(__keyword) {
			return similar.indexOf(__keyword.toLowerCase()) > -1;
		});
	}), function(__package) {
		return {
			name: __package.name,
			version: __package.version,
			description: __package.description,
			keywords: __package.keywords || []
		};
	});
	callback(null, libraries);
};


module.exports.getVersionsByName = function getVersionsByName(name) {
	debug('getVersionsByName(%o)', name);

	var pckg = _.find(packages, function(__package) {
		return __package.name === name;
	});

	return pckg.assets.map(function(__asset) {
		return __asset.version;
	});
};


module.exports.getLatestVersionByName = function getLatestVersionByName(name) {
	debug('getLatestVersionByName(%o)', name);

	var pckg = _.find(packages, function(__package) {
		return __package.name === name;
	});

	return pckg.version;
};


module.exports.getTopKeywords = function getTopKeywords() {
	debug('getTopKeywords()');

	return _(packages)
		.chain()
		.pluck('keywords')
		.replaceFlatten(SIMILAR)
		.compact() // remove falsy;
		.countBy(function(a) {
			return a.toLowerCase();
		})
		.pairs()
		.sortBy(1)
		.reverse()
		.take(10)
		.value();
};


module.exports.getKeywords = function getKeywords() {
	debug('getKeywords()');

	return _(packages)
		.chain()
		.pluck('keywords')
		.replaceFlatten(SIMILAR)
		.compact() // remove falsy;
		.countBy(function(a) {
			return a.toLowerCase();
		})
		.reduce(function(o, v, k) {
			if (v > 1 && k.length > 1) {
				o.push(k);
			}
			return o;
		}, [])
		.value()
		.sort(function(a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
};


module.exports.getByName = function getByName(name, callback) {
	debug('getByName(%o)', name);
	return get(name, null, callback);
};


module.exports.getByVersion = function getByVersion(name, version, callback) {
	debug('getByVersion(%o, %o)', name, version);
	return get(name, version, callback);
};


// Check if packageSize is outdated;
function isOutdated(packageSize) {
	var now = new Date();
	var outdated = now - new Date(packageSize.lastChecked) > OUTOFDATEINTERVAL;
	debug('get(%o, %o) -> isOutdated(%o): %o', packageSize.name, packageSize.version, packageSize.lastChecked, outdated);
	return outdated;
}

/*
 * Get package from packagessize.json or alternatifly from packages.json
 * by name or optional specified version;
 */
function get(name, version, callback) {
	debug('get(%o, %o)', name, version);

	// Find package from external packages.json;
	var pckg = _.find(packages, function(__package) {
		return __package.name === name;
	});

	// Package version or latest from packages.json;
	version = version || pckg.version;

	// Read contents from packagessize.json, if it has contents;
	fs.readFile(packageSizeJSON, 'utf8', function readPackageSizeJSON(err, data) {
		var packagesSize = data && JSON.parse(data) || {
			packages: []
		};

		// Find correct packageSize by name & version;
		var packageSize = _.find(packagesSize.packages, function(__packageSize) {
			return __packageSize.name === name && __packageSize.version === version;
		});

		var isExistingPackageSize = !!packageSize;
		debug('get(%o, %o) -> isExistingPackageSize: %o', name, version, isExistingPackageSize);

		// Check if packageSize exists and not is outdated;
		if (isExistingPackageSize && !isOutdated(packageSize)) {
			return callback(null, packageSize);
		} else {
			// Get correct assets from package;
			var asset = _.find(pckg.assets, function(__asset) {
				return __asset.version === version;
			});

			// Get file size for all assets in package;
			var parallel = asset.files.map(function(__file) {
				return function(__callback) {
					var url = createUrl(pckg.name, version, __file);
					getSize(url, function(err, size) {
						if (err) {
							__callback(err);
						} else {
							__callback(null, {
								name: __file,
								size: size,
								link: url
							});
						}
					});
				};
			});

			async.parallel(parallel, function(err, __assets) {
				if (err) {
					callback(err);
				} else {
					var assets = {
						'/': []
					};

					// Put assets in dir tree;
					_.each(__assets, function(__asset) {
						var recursive = assets;

						// Check if asset name is actually part of a path;
						if (__asset.name.indexOf('/') >= 0) {
							var folders = __asset.name.split('/');

							// Remove file name;
							folders.pop();

							// Loop through folders;
							for (var folder in folders) {
								recursive = recursive[folders[folder]] ||
									(recursive[folders[folder]] = {
										'/': []
									});
							}
						}

						recursive['/'].push(__asset);
					});

					// New or override existing;
					packageSize = packageSize || {};
					packageSize.name = name;
					packageSize.version = version;
					packageSize.description = pckg.description;
					packageSize.lastChecked = new Date();
					packageSize.homepage = pckg.homepage;
					packageSize.keywords = pckg.keywords || [];
					packageSize.assets = assets;

					// Append to list if packageSize doesn't exists;
					if (!isExistingPackageSize) {
						packagesSize.packages.push(packageSize);
					}

					callback(null, packageSize);

					// Save to packagessize.json;
					fs.writeFile(packageSizeJSON, JSON.stringify(packagesSize, null, 4), function(err) {
						if (err) {
							console.log('Error saving to ' + packageSizeJSON, err);
						} else {
							debug('get(%o, %o) -> saved: %o', name, version, packageSizeJSON);
						}
					});
				}
			});
		}
	});
}
