$(function() {
	$('#libraries').btsListFilter('#searcher', {
		itemChild: 'h3',
		resetOnBlur: false
	});
	$('#searcher').focus();
});