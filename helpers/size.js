var request = require('request'),
	url = require('url');

function getSize(file, next) {
	var compressed = 0,
		decompressed = 0;
	request.get({
			url: url.parse(file)
		}, function(error, res, body) {
			//console.log('callback', arguments.length);
			if (res.statusCode == 200) {
				if (res.headers && res.headers['content-length']) {
					compressed = parseInt(res.headers['content-length'], 10);
					//console.log('yes header content-length: ', compressed);
				} else {
					compressed = body.length;
					//console.log('no header content-length; body length: ', compressed);
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
			//console.log('data', arguments.length);
			decompressed += Buffer.byteLength(data.toString(), 'utf8');
		})
		/*.on('end', function () {
				console.log('end', arguments.length);
			})*/
		.on('complete', function(err) {
			//console.log('complete', arguments.length);
			next({
				compressed: compressed,
				decompressed: decompressed
			});
		}).on('error', function(err) {
			console.log('error', arguments);
		});
}
exports.getSize = getSize;
