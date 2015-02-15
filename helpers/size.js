'use strict';

var request = require('request'),
	url = require('url');

module.exports.getSize = function getSize(file, next) {
	var compressed = 0,
		decompressed = 0;

	request.get({
			url: url.parse(file)
		}, function(err, res, body) {
			if (!err && res.statusCode === 200) {
				if (res.headers && res.headers['content-length']) {
					compressed = parseInt(res.headers['content-length'], 10);
				} else {
					compressed = body.length;
				}
			}
		})
		/*.on('response', function (res) {
			console.log('response', arguments.length);
			if (res.statusCode == 200) {
				if (res.headers && res.headers['content-length']) {
					compressed = parseInt(res.headers['content-length'], 10);
					console.log('yes header content-length: ', compressed);
				} else {
					console.log('no header content-length; calculating compressed data...');
					res.on('data', function (data) {
						compressed += data.length;
					});
				}
			}
		})*/
		.on('data', function(data) {
			decompressed += Buffer.byteLength(data.toString(), 'utf8');
		})
		.on('complete', function(err) {
			next(null, {
				compressed: compressed,
				decompressed: decompressed
			});
		}).on('error', function(err) {
			next(err);
		});
};
