var _ = require('underscore');

_.mixin({
	replace: function _replace(array, similars) {
		_.each(similars, function(value, key) {
			for (var i in value) {
				var index = array.indexOf(value[i]);
				if (index > -1) {
					array[index] = key;
				}
			}
		});
		return array;
	},
	replaceFlatten: function _replaceFlatten(array, similars) {
		// remove falsy otherwise reduceRight errors a lot;
		return _.reduceRight(_.compact(array), function(a, b) {
			// uniq is important to not count double keywords;
			return a.concat(_.uniq(_.replace(_.clone(b), similars)));
		}, []);
	}
});

module.exports = _;
