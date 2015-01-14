var getSize = require('./size.js').getSize;


function createUrl(name, version, file) {
	return 'http://cdnjs.cloudflare.com/ajax/libs/' + name + '/' + version + '/' + file;
// https://github.com/cdnjs/cdnjs/wiki/Extensions%2C-Plugins%2C-Resources
}


var packages = require(__dirname + '\\data\\packages-small.json').packages;
//console.log(packages);
//console.log("-----------");
packages.forEach(function (package) {
	//console.log(package.name, package.version);
	//console.log(package.assets);
	
	var asset;
	var len = package.assets.length >>> 0;
	for (var i = 0; i < len; i++) {
		if (i in package.assets && package.assets[i].version === package.version) {
			asset = package.assets[i];
			break;
		}
	}
	
	asset.files.forEach(function (file) {
		var url = createUrl(package.name, package.version, file.name);
		//console.log(url);
		getSize(url, function (size) {
			console.log(package.name, package.version, file.name, size);
		});
	});

	//package.assets.forEach(function(asset){
	//	console.log(asset);
	//	asset.files.forEach(function (file) {
	//		console.log(file.name);
	//						getSize()
	//	});
	//});
});





//getSize('https://code.angularjs.org/1.3.8/angular.min.js', function (size) {
//	console.log(size);
//});

//getSize('http://cdnjs.cloudflare.com/ajax/libs/embedly-jquery/3.1.1/jquery.embedly.min.js', function (size) {
//	console.log(size);
//});
