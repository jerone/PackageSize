var _ = require('underscore');
var async = require('async');

var getSize = require('../helpers/size.js').getSize;

var packages = require(__dirname + '\\..\\data\\packages.json').packages;

function createUrl(name, version, file) {
	return 'http://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + file;
	// https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources
}


module.exports.getAll = function getAll(callback) {
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
	var package = _.find(packages, function(__package) {
		return __package.name === name;
	});

	return package.assets.map(function(__asset) {
		return __asset.version;
	});
};


module.exports.getLatestVersionByName = function getLatestVersionByName(name) {
	var package = _.find(packages, function(__package) {
		return __package.name === name;
	});

	return package.version;
};


module.exports.getKeywords = function getKeywords() {
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
	return get(name, null, callback);
};


module.exports.getByVersion = function getByVersion(name, version, callback) {
	return get(name, version, callback);
};

function get(name, version, callback) {
	var package = _.find(packages, function(__package) {
		return __package.name === name;
	});

	version = version || package.version;
	var asset = _.find(package.assets, function(__asset) {
		return __asset.version === version;
	});

	var parallel = asset.files.map(function(__file) {
		return function(__callback) {
			var url = createUrl(package.name, version, __file.name);
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

	async.parallel(parallel, function(err, assets) {
		if (err) {
			callback(err);
		} else {
			callback(null, {
				name: name,
				version: version,
				description: package.description,
				homepage: package.homepage,
				keywords: package.keywords || [],
				assets: assets
			});
		}
	});
}
