

var canvMen = {
	gen: function(data) {
		var canvSelected;
		var menu = $jConstruct('div', {
			id: 'canvSelMenu',
		});

		for(var i = 0; i < data._Canvases.length; ++i) {
			var tileTitle = $jConstruct('div', {
				text: data._Canvases[i]._strCanvasDescription,
			});
			var tileDtCreated = $jConstruct('div', {
				text: 'Created: ' +  data._Canvases[i]._dtDateAdded.toString(),
			});	
			var tile = $jConstruct('div', {
				id: 'tile' + i,
			}).addChild(tileTitle).addChild(tileDtCreated).css({
				'border': '1px solid black',
				'border-radius': '10px',
				'width': '100%',
			}).event('mouseover', function() {
				$('#'+this.id).css({
					'background-color': 'grey',
				});
			}).event('mouseout', function() {
				$('#'+this.id).css({
					'background-color': 'white',
				});
			}).event('click', function() {
				canvSelected = this.id.substring(this.id.length - 1, this.id.length);
				console.log(parseInt(canvSelected) + 1);
				$db.getCanJson(parseInt(canvSelected) + 1, credentials.PhotographerID).done(function(data) {
					projData.canvObj = JSON.parse(data.substring(1, data.length - 1));
					fabCanvas.loadFromJSON(projData.canvObj);
					fabCanvas.renderAll();
					$.colorbox.close();
				}); 
			});
			menu.addChild(tile);
		}
		
		menu.addChild($jConstruct('button', {
			text: 'New Canvas',
		}).event('click', function() {
			$('#cbDateEdit').empty();
			crMenu().appendTo('#cbDateEdit');
			var w = $('#canvMenu').width() + 70;
			var h = $('#canvMenu').height() + 70;
			$.colorbox.resize({width: w, height: h});
		}));

		return menu;		
	},
};
