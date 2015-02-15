'use strict';

$(function() {
	$.material.init();

	$('#libraries').btsListFilter('#searcher', {
		itemChild: 'h3',
		resetOnBlur: false
	});
	$('#searcher').focus();
});
