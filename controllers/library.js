'use strict';

var _ = require('underscore');
var async = require('async');
var debug = require('debug')('packagesize:library');

var getSize = require('../helpers/size.js').getSize;

var packages = require(__dirname + '\\..\\data\\packages.json').packages;

function createUrl(name, version, file) {
	return 'http://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + file;
	// https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources
}


module.exports.getAll = function getAll(callback) {
	debug('getAll()');

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


module.exports.getAllByKeyword = function getAllByKeyword(keyword, callback) {
	debug('getAllByKeyword(%o)', keyword);

	keyword = keyword.toLowerCase();
	var libraries = _.map(_.filter(packages, function(__package) {
		return _.some(__package.keywords, function(__keyword) {
			return __keyword.toLowerCase() === keyword;
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


module.exports.getKeywords = function getKeywords() {
	debug('getKeywords()');

	return _.reduce(_.countBy(_.compact(_.flatten(_.pluck(packages, 'keywords'), true)), function(a) {
		return a.toLowerCase();
	}), function(o, v, k) {
		if (v > 1) {
			o.push(k);
		}
		return o;
	}, []).sort(function(a, b) {
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

function get(name, version, callback) {
	debug('get(%o, %o)', name, version);

	var pckg = _.find(packages, function(__package) {
		return __package.name === name;
	});

	version = version || pckg.version;
	var asset = _.find(pckg.assets, function(__asset) {
		return __asset.version === version;
	});

	var parallel = asset.files.map(function(__file) {
		return function(__callback) {
			var url = createUrl(pckg.name, version, __file.name);
			getSize(url, function(err, size) {
				if (err) {
					__callback(err);
				} else {
					__callback(null, {
						name: __file.name,
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

			_.each(__assets, function(__asset) {
				var recursive = assets;

				// Check if asset name is actually part of a path;
				if (__asset.name.indexOf('/') >= 0) {
					var folders = __asset.name.split('/');

					// Remove file name;
					folders.pop();

					// Loop through folders;
					for (var folder in folders) {
						recursive = recursive[folders[folder]] || (recursive[folders[folder]] = {
							'/': []
						});
					}
				}

				recursive['/'].push(__asset);
			});

			callback(null, {
				name: name,
				version: version,
				description: pckg.description,
				homepage: pckg.homepage,
				keywords: pckg.keywords || [],
				assets: assets
			});
		}
	});
}
