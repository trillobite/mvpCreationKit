

var canvMen = {
	gen: function(data) {
		console.log(data);
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
				'border-radius': '5px',
				'width': '100%',
				'cursor': 'pointer',
				'font-family': 'sans-serif'
			}).event('mouseover', function() {
				$('#'+this.id).css({
					'background-color': 'grey',
				});
			}).event('mouseout', function() {
				$('#'+this.id).css({
					'background-color': 'white',
				});
			}).event('click', function() {
				$('#loadSpinner').show();
				console.log('canvas ID:', this.id);
				canvSelected = parseInt(this.id.substring(this.id.indexOf('e') + 1, this.id.length)); //should extract the tile number that was clicked on.
				console.log('canvas list number:', canvSelected);
				canvSelectedID = data._Canvases[canvSelected]._indxPhotographerPackagePriceCanvasID;
				console.log('canvasID:', canvSelectedID);

				$db.getCanJson(canvSelectedID, credentials.PhotographerID).done(function(obj) {
					console.log(obj);
					if(obj) {
						console.log(obj[0]);
						if(obj[0] == '"') {
							projData.canvObj = JSON.parse(obj.substring(1, obj.length - 1));
						} else {
							projData.canvObj = obj;
						}
						projFuncs.loadProjData(projData.canvObj);
						fabCanvas.renderAll();
						/*fabCanvas.loadFromJSON(projData.canvObj);
						fabCanvas.renderAll();*/
					} else { //if there is no data yet (new canvas).
						shadoWindow.load(); //load an empty shadoWindow.
					}
					$.colorbox.close();
					//template.customColorbox();
					setTimeout(function() {
						$('#loadSpinner').fadeOut('slow');
					}, 500); //fades out after wating 500 milliseconds.
				}); 
			});
			menu.addChild(tile);
		}
		
		menu.addChild($jConstruct('button', {
			text: 'New Canvas',
		}).event('click', function() {
			$('#cbDateEdit').empty();
			crMenu().appendTo('#cbDateEdit').state.done(function() {
				$.colorbox.resize(); //after rendering of the html is done, resize the colorbox.
			});
		}));

		return menu;		
	},
};
