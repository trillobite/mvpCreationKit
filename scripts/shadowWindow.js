
/*

next step is to make it open when the site opens.

var testing = shadoWindow.build(projDB.query({
    where: {
        collection: function(input) {
            return input != undefined;
        },
    }
}));
*/

var shadoWindow = {};
shadoWindow.startColorbox = function() {
	$.listerColorbox({
		html: '<div id="shadoWindow" style="width:100%;height:100%;"></div>',
		width: '365',
		height: '410',
		//opacity: '0.5',
		top: '20%',
		left: '65%',
		overlayClose: false
	});
	//$('#shadoWindow').css({
	//	'border': '1px dotted black',
	//});
	//makes sure that all of the elements don't become a draggable object.
	editWindow.draggableExclusions.register('#shadoWindow');
	editWindow.draggableExclusions.register('#divShadowCntrl'); //exclude the main shadow control div.
	editWindow.draggableExclusions.register('.shadoSlider');
	editWindow.draggableExclusions.register('.ui-slider');
	editWindow.draggableExclusions.register('.ui-widget');
	editWindow.draggableExclusions.register('#StrokeColor');
	editWindow.draggableExclusions.register('.draggableExclude');
	$('#listerColorbox').tinyDraggable({
		handle:'#lCboxContent', 
		exclude: editWindow.draggableExclusions.constructString(), //Set the registered exclusions.
	});
	$('#lCboxOverlay').remove();
};

shadoWindow.clearAll = function() {

	//get all of the tiles in the shadoWindow.
	var tiles = arrdb.query({
		where: {
			name: 'canvasTile',
		}
	});

	//loop through all of them.
	var loopTiles = function(arr) {
		for(var i = 0; i < arr.length; ++i) {
			if(arr[i].length) {
				loopTiles(arr[i]);
			} else {
				arr[i].css({ //reset the background color.
					'background-color': 'white',
				});
			}
		}
	};

	loopTiles(tiles);
};

//select an object in the shadoWindow, by ID of canvas object.
shadoWindow.selectAsFocusedObject = function(canvasObjID) {
	shadoWindow.clearAll(); //clear anything already selected.
	//find the shadoWindow tile.
	var tile = arrdb.query({
		where: {
			linkedto: canvasObjID,
		}
	});

	//pull out of array, if the object is an array.
	var tile = tile.length ? tile[0] : tile;

	fabCanvas.setActiveObject(projDB.get(tile.linkedto));

	$('#' + tile.id).css({
		'background-color': 'gray',
	});

};

//select a group in the shadoWindow.
//selection color should turn blue, as it's already gray.
shadoWindow.selectAsFocusedGroup = function(group) {

};

//will bring group items to the foreground.
shadoWindow.groupForward = function(group) {
	
};

//will bring group items to the background.
shadoWindow.groupBack = function(group) {
	
};

shadoWindow.build = function(coll) {
	shadoWindow.startColorbox();
	var tiles = [];
	//ensure that this tile does not already exist.
	var getIndex = function(term, property) {
		for(var i = 0; i < tiles.length; ++i) {
			if(tiles[i][property] == term) {
				return i;
			}
		}
		return -1;
	};
	var contains = function(term, property) {
		if(getIndex(term, property) > -1) {
			return true;
		}
		return false;
	};
	//adds an object to the tiles array.
	var addObj = function(txt) {
		if(!contains(txt, 'collection')) {
			var indx = tiles.length; //Will add to the end of the 'tiles' array.

			var collectionContainer = $jConstruct('div', { //the tile to add.
				collection: txt,
				class: 'draggableExclude', //makes it so that the draggable function will exclude this div.
			}).css({
				//'border': '1px solid black',
				'border-right': '1px dotted black',
				'border-left': '1px dotted black',
				'border-bottom': '1px dotted black',
				'border-radius': '4px',
				'float': 'left',
			}).event('mouseover', function() {
				$('#'+this.id).css({ //makes the collection shadow glow during mouse-over.
					//FF2400 //red
					'-moz-box-shadow': '0 0 10px blue',
					'-webkit-box-shadow': '0 0 10px blue',
					'box-shadow': '0 0 10px blue',
				});
			}).event('mouseout', function() {
				$('#'+this.id).css({ //turns off the mouse-over glow when object is no longer being moused-over.
					'-moz-box-shadow': '0 0 10px white',
					'-webkit-box-shadow': '0 0 10px white',
					'box-shadow': '0 0 10px white',
				});
			});

			var tileTitle = $jConstruct('div', {
				class: 'draggableExclude', //makes it so that the draggable function will exclude this div.
				text: txt, //This is the collection title text that the user will see within the tile.
			}).css({
				'border': '1px solid black',
				'background-color': 'gray',
				'width': '260px',
				'text-align': 'center',
				'border-top-right-radius': '4px',
				'border-top-left-radius': '4px',
				'cursor': 'default', //so that it won't turn into text pointer where there is text.
			});

			var settingsGear = $jConstruct('img', {
				src: './css/images/settingsGear.png',
			}).css({
				'width': '20px',
				'height': '20px',
				'float': 'right',
				'cursor': 'pointer',
			}).event('click', function() {
				console.log('settings gear clicked!');
			});

			/*var dropDownElements = $jConstruct('div', {
				id: 'myDropdown',
				class: 'dropdown-content',
			}).addChild($jConstruct('a', {
				href: '#',
				text: 'Link 1',
			})).addChild($jConstruct('a', {
				href: '#',
				text: 'Link 2',
			})).addChild($jConstruct('a', {
				href: '#',
				text: 'Link 3',
			}));*/
			
			collectionContainer.addChild(tileTitle.addChild(settingsGear));
			tiles[indx] = collectionContainer;
		}
	};
	for(var i = 0; i < coll.length; ++i) {
		var obj = coll[i];
		if(obj.length) {
			addObj(obj[0].collection);
		} else {
			addObj(obj.collection);
		}
	}
	addObj('unassigned');
	for(var i = 0; i < fabCanvas._objects.length; ++i) {
		var obj = fabCanvas._objects[i];
		//create a 2D
		var arr2D = toadFish.create2DArray(1);
		var source = (function() { //determine which image to use.
			if(obj.type == 'image') {
				return './css/images/inkscape.png';
			} else {
				return './css/images/word.png';
			}
		})();
		arr2D[0][0] = $jConstruct('img', {
			src: source,
		}).css({
			'width': '20px',
			'height': '20px',
			'float': 'left',
		});
		arr2D[0][1] = (function() {
			var arrows = [];

			/*
				indx: 		which arrow to change?
				delay: 		how long before switching icon?
				imageName: 	what is the name of the image within this directory?
			*/
			var imageSwap = function(indx, delay, imageName) {
				var thisArrowObject = arrdb.get(arrows[indx].id);
				thisArrowObject.src = './css/images/' + imageName;
				setTimeout(function() {
					thisArrowObject.refresh();
				}, delay);
			};

			//Layer Up Arrow
			arrows[0] = $jConstruct('img', { //arrow naturally pointing up.
				src: './css/images/blackArrow.png',
				boundto: obj.id,
			}).css({
				'width': '20px',
				'height': '10px',
				'float': 'left',
				'cursor': 'pointer',
			}).event('mousedown', function() {
				imageSwap(0, 5, 'whiteArrow.png'); //swaps image to the white version.
				projDB.get(arrdb.get(this.id).boundto).bringForward(true);
			}).event('mouseup', function() {
				imageSwap(0, 25, 'blackArrow.png'); //25ms delay to switch back image.
			});

			//Layer Down Arrow
			arrows[1] = $jConstruct('img', { //same arrow image, just flipped to point down
				src: './css/images/blackArrow.png',
				boundto: obj.id,
			}).css({
				'width': '20px',
				'height': '10px',
				'float': 'left',
				'cursor': 'pointer',
		        '-moz-transform': 'scaleY(-1)',
		        '-o-transform': 'scaleY(-1)',
		        '-webkit-transform': 'scaleY(-1)',
		        'transform': 'scaleY(-1)',
		        'filter': 'FlipV',
		        '-ms-filter': "FlipV",
			}).event('mousedown', function() {
				imageSwap(1, 5, 'whiteArrow.png'); //swaps image to the white version.
				projDB.get(arrdb.get(this.id).boundto).sendBackwards(true);
			}).event('mouseup', function() {
				imageSwap(1, 25, 'blackArrow.png'); //25ms delay to switch back image.
			});

			//return a toadFish grid that contains everything.
			return $jConstruct('div').addChild(toadFish.structure(arrows, 'imgArrows')).css({
				'float': 'left',
			});
		})();
		var objText = function() {
			if(obj.hasOwnProperty('name')) {
				if(obj.name != 'name not defined') {
					return obj.name;
				}
			}
			return obj.id;
		};
		var tileStyle = {
			'float': 'left',
			'cursor': 'default',
			//'border': '1px solid black',
			'width': '195px',
		};

		/*var compressText = function(txtInput) {
			//code that cuts text down to 20 characters.
			if(txtInput) { //if txtInput is not undefined.
				if(txtInput.length > 20) { //if the text length is greater than 20 characters.
					return txtInput.substring(0, 18) + '...'; //shorten the length, and return it.
				}
			}
			return txtInput; //just return the object if it cannot be worked with.
		};*/

		arr2D[0][2] = $jConstruct('div', {
			text: objText(),
			linkedto: obj.id,
			name: 'canvasTile',
		}).event('keypress', function(e) {
		    if(e.which == 13) { //enter keystroke
				var currObj = arrdb.get(this.id);
				if(currObj.type == 'textbox') { //checks if editing was enabled.
					currObj.text = $('#'+this.id)[0].value;
					//currObj.name = $('#'+this.id)[0].value;
					console.log('keypress:', currObj.linkedto);
					projDB.get(currObj.linkedto).name = $('#'+this.id)[0].value;
					currObj.type = 'div';
					currObj.refresh();	
					currObj.css(tileStyle);
				}				
		    }
		}).event('hover', function() {
			$('#'+this.id).css({
				'background-color': 'gray',
			});
		}).event('mouseout', function() {
			var activeObject = fabCanvas.getActiveObject();
			var current = projDB.get(arrdb.get(this.id).linkedto);

			//console.log(activeObject, current.id);

			var setWhite = function(id) {
				$('#'+id).css({
					'background-color': 'white',
				});
			};

			if(activeObject) { //is something selected on the canvas?
				if(activeObject.id != current.id) { //if this is not the selected object, set white.
					setWhite(this.id);
				}
			} else { //if not, just set the color to white.
				setWhite(this.id);
			}
		}).event('click', function() {
			//console.log(arrdb.get(this.id));
			//console.log(arrdb.get(this.id).linkedto);
			//console.log(projDB.get(arrdb.get(this.id).linkedto));
			var tmp = $('div[name="canvasTile"]');
			for(var i = 0; i < tmp.length; ++i) { //clear the color for everything.
				arrdb.get(tmp[i].id).css({
					'background-color': 'white',
				});
			}
			var activeObject = fabCanvas.getActiveObject();
			var current = projDB.get(arrdb.get(this.id).linkedto);
			if(activeObject !== current) { //If the clicked object is not already selected.
				fabCanvas.setActiveObject(current);
				$('#'+this.id).css({
					'background-color': 'gray',
				});
			}
		}).css(tileStyle);
		arr2D[0][3] = $jConstruct('img', {
			linkedto: arr2D[0][2].id,
			src: './css/images/photoshop.png',
		}).event('click', function() { //starts the edit process.
			console.log(this);
			var currObj = arrdb.get(arrdb.get(this.id).linkedto);
			if(currObj.type == 'div') {
				currObj.type = 'textbox';
				currObj.refresh();
				currObj.css({
					'cursor': 'text',
					'width': '195px',
				});
				currObj.value = currObj.text;
			}	
		}).css({
			'width': '20px',
			'height': '20px',
			'float': 'right',
			'cursor': 'pointer',
		});
		if(obj.hasOwnProperty('collection')) {
			var indx = getIndex(obj.collection, 'collection');
			tiles[indx].addChild(toadFish.structure(arr2D, obj.collection+'grid'));
		} else {
			var indx = getIndex('unassigned', 'collection');
			tiles[indx].addChild(toadFish.structure(arr2D, obj.collection+'grid'));
		}
	}
	var structure = toadFish.structure(tiles, 'test').css({
		'padding-left': '10px',
		'padding-top': '10px',
		'font-family': 'arial',
		//'padding': '10px',	
	});
	//editWindow.draggableExclusions.register('#'+structure.id);
	structure.appendTo('#shadoWindow');
	
	var toolSidebar = $jConstruct('div').css({
		//'width': '40px',
		//'height': '200px',
		//'border': '1px solid black',
		'float': 'left',
	});
	var toolButtonSize = '30px';
	var toolButtonCss = {
		'width': toolButtonSize,
		'height': toolButtonSize,
		'float': 'left',
		'clear': 'left',
		'cursor': 'pointer',
	};
	toolSidebar.addChild($jConstruct('img', {
		src: './css/images/settingsGear.png',
	}).css(toolButtonCss).css({
		'padding-top': '5px',
	}));

	var getCanvasData = function() {
		var canvData = fabCanvas.toJSON();
		canvData.canvDimensions = { //add existing width and height to the saved canvas data.
		    width: fabCanvas.width,
		    height: fabCanvas.height,
		};
		for(var i = 0; i < canvData.objects.length; ++i) {
		    var typeMatch = projDB.query({
		        where: {
		            type: canvData.objects[i].type,
		        }
		    });
		    for(var j = 0; j < typeMatch.length; ++j) {
		        if(canvData.objects[i].type == 'image') {
		            if(canvData.objects[i].src == typeMatch[j].src) {
		                canvData.objects[i].name = typeMatch[j].name;
		                canvData.objects[i].id = typeMatch[j].id;
		                canvData.objects[i].collection = typeMatch[j].collection;
		            }
		        } else {
		            if(canvData.objects[i].text == typeMatch[j].text) {
		                canvData.objects[i].name = typeMatch[j].name;
		                canvData.objects[i].id = typeMatch[j].id;
					    canvData.objects[i].borderColor = typeMatch[j].borderColor;
					    canvData.objects[i].collection = typeMatch[j].collection;
		            }
		        }
		    }
		}
		console.log(canvData);
		return canvData;
	};

	toolSidebar.addChild($jConstruct('img', {
		src: './css/images/save.png',
	}).event('click', function() {
		//handle clicking the save button.
		console.log('saveData:', getCanvasData());
	}).css(toolButtonCss));

	toolSidebar.addChild($jConstruct('img', {
		src: './css/images/trash.png',
	}).css(toolButtonCss).css({
		'padding-top': '3px',
		'padding-bottom': '3px',
	}).event('click', function() {
		if(fabCanvas.getActiveObject()) { //if there is something active on the canvas.
			projDB.remove(fabCanvas.getActiveObject().id); //remove from micronDB.
			fabCanvas.getActiveObject().remove(); //remove from the canvas.
		}
	}));

	toolSidebar.addChild($jConstruct('img', {
		src: './css/images/newButton.png',
	}).css(toolButtonCss));
	
	toolSidebar.appendTo('#shadoWindow');
	
	return structure;
};