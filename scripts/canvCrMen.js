

var crMenu = function() {
	
	var menu = $jConstruct('div', {
		id: 'canvMenu',
	});
	var title = $jConstruct('div', {
		text: 'Make A New Canvas',
	});
	var desInput = $jConstruct('textarea', {
		text: 'Enter description here.',
		cols: '40',
		rows: '4',
	});
	var btnOk = $jConstruct('button', {
		text: 'Submit',
	}).event('click', function() {
		$db.mkNwCanDef(credentials.PricingFormID, $('#'+desInput.id).val(), credentials.PhotographerID).done(function(data) {
			console.log('Done:', data);

			var index = projData.availCanv._Canvases.length;
			var nwCan = data._Canvases[0];

			projData.availCanv._Canvases[index] = nwCan;

			canvSelected = index;
			$.colorbox.close();
		});
	});
	var btnCancel = $jConstruct('button', {
		text: 'Cancel',
	}).event('click', function() {
		$('#cbDateEdit').empty();
		canvMen.gen(projData.availCanv).appendTo('#cbDateEdit').state.done(function() {
			$.colorbox.resize(); //after rendering of html is done, resize the colorbox.
		});
	});
	var btnContainer = $jConstruct('div').addChild(btnOk).addChild(btnCancel);

	return menu.addChild(title).addChild(desInput).addChild(btnContainer);

};
