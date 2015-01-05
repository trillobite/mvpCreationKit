

var crMenu = function() {
	
	var menu = $jConstruct('div', {
		id: 'canvMenu',
	});
	var title = $jConstruct('div', {
		text: 'Make A New Canvas',
	});
	var desInput = $jConstruct('textarea', {
		text: 'Enter description here.',
		cols: '50',
		rows: '4',
	});
	var btnOk = $jConstruct('button', {
		text: 'Submit',
	}).event('click', function() {

	});
	var btnCancel = $jConstruct('button', {
		text: 'Cancel',
	}).event('click', function() {
		$('#cbDateEdit').empty();
		canvMen.gen(projData.availCanv).appendTo('#cbDateEdit');
		var w = $('#canvSelMenu').width() + 10;
		var h = $('#canvSelMenu').height() + 90;
		$.colorbox.resize({width: w, height: h});

	});
	var btnContainer = $jConstruct('div').addChild(btnOk).addChild(btnCancel);

	return menu.addChild(title).addChild(desInput).addChild(btnContainer);

};
