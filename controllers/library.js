var _ = require('underscore');
var async = require('async');

var getSize = require('../helpers/size.js').getSize;

var packages = require(__dirname + '\\..\\data\\packages.json').packages;

function createUrl(name, version, file) {
	return 'http://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + file;
	// https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources
}

function getAll(callback) {
	var libraries = _.map(packages, function(__packages) {
		return {
			name: __packages.name,
			version: __packages.version,
			description: __packages.description,
			keywords: __packages.keywords || []
		};
	});
	callback(null, libraries);
}
module.exports.getAll = getAll;

function getVersions(name) {
	var package = _.find(packages, function(__package) {
		return __package.name === name;
	});

	return package.assets.map(function(__asset) {
		return __asset.version;
	});
}
module.exports.getVersions = getVersions;

function getByName(name, callback) {
	return get(name, null, callback);
}
module.exports.getByName = getByName;

function getByVersion(name, version, callback) {
	return get(name, version, callback);
};
module.exports.getByVersion = getByVersion;

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
			getSize(url, function(__size) {
				__callback(null, {
					file: __file.name,
					size: __size
				});
			});
		};
	});

	async.parallel(parallel, function(err, assets) {
		var library = {
			name: name,
			version: version,
			description: package.description,
			keywords: package.keywords || [],
			assets: assets
		};

		callback(null, library);
	});
}