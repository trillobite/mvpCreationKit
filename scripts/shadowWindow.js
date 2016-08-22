
/*
	to run this project:

	var testing; 
	shadoWindow.build(projDB.query({
	    where: {
	        collection: function(input) {
	            return input != undefined;
	        },
	    }
	})).done(function(input) {
		testing = input; //Can reference shadoWindow through the 'testing' object.
	});
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


/*
	Makes shadoWindow reload, without killing colorbox.
*/
shadoWindow.refresh = function(coll) {

	var clr = function(elems) { //remove all jsonHTML objects from the DOM.
		for(var i = 0; i < elems.length; ++i) {
			if(!elems[i].length) {
				arrdb.remove(elems[i].id); //TypeError: t is undefined
				elems[i].remove();
			} else {
				clr(elems[i]);
			}			
		}
	};

	clr(arrdb.query({ //find all the elements contained under shadoWindow, and run clr.
		where: {
			parent: '#shadoWindow',
		}
	}));

	shadoWindow.build(coll).done(function() {
		shadoWindow.select(selected); //reselect the active object.	
	}); //start up everything fresh again.
};

/*
	Will set a canvas object as active, and mark it as the active object
	within shadoWindow.
*/
shadoWindow.select = function(id) {

	var obj = arrdb.query({ //get the shadoWindow tile.
		where: {
			linkedto: id,
		},
	});

	if(obj.length) { //filter out the array, query should only return one object.
		obj = obj[0];
	}

	console.log('obj:', obj);

	if(selected != id) { //if the object we are selecting, is not already selected. 
		selected = id;
		shadoWindow.resetTiles(); //clear all selected tiles.
		fabCanvas.deactivateAll(); //clear all selected objects in the canvas.
		fabCanvas.setActiveObject(projDB.get(id)); //select an object as active.

		$('#' + obj.id).css({ //select object within shadoWindow
			'background-color': 'gray',
		});
	}

};

/*
	Resets the 'selected' status of all the tiles in the shadoWindow.
*/
shadoWindow.resetTiles = function() {
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
	fabCanvas.deactivateAll();
	shadoWindow.resetTiles(); //clear anything already selected.
	//find the shadoWindow tile.
	var tile = arrdb.query({
		where: {
			linkedto: canvasObjID,
		}
	});

	//pull out of array, if the object is an array.
	var tile = tile.length ? tile[0] : tile;

	if(selected != tile.linkedto) {
		fabCanvas.setActiveObject(projDB.get(tile.linkedto));	
	}

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

//loads everything with colorbox.
shadoWindow.load = function(coll) {
	var dfd = $.Deferred();
	shadoWindow.startColorbox();
	shadoWindow.build(coll).done(function(input) {
		dfd.resolve(input); 
	});
	return dfd.promise();
};

//loads everything INTO colorbox (load colorbox first).
shadoWindow.build = function(coll) {
	var dfd = new $.Deferred();
	//shadoWindow.startColorbox();
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

	var mkContainer = function(txt) {
		var divID = 'collectionContainer' + txt;

		return $jConstruct('div', { //the tile to add.
			id: divID,
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
			if(shadoWindow.sel != this.id) {
				$('#'+this.id).css({ //makes the collection shadow glow during mouse-over.
					//FF2400 //red
					'-moz-box-shadow': '0 0 10px blue',
					'-webkit-box-shadow': '0 0 10px blue',
					'box-shadow': '0 0 10px blue',
				});
			}
		}).event('mouseout', function() {
			if(shadoWindow.sel != this.id) {
				$('#'+this.id).css({ //turns off the mouse-over glow when object is no longer being moused-over.
					'-moz-box-shadow': '0 0 10px white',
					'-webkit-box-shadow': '0 0 10px white',
					'box-shadow': '0 0 10px white',
				});
			}
		}).event('click', function() {
			if(shadoWindow.sel != this.id) {
				if(shadoWindow.sel != 'unassigned') {
					$('#'+shadoWindow.sel).css({
						'-moz-box-shadow': '0 0 10px white',
						'-webkit-box-shadow': '0 0 10px white',
						'box-shadow': '0 0 10px white',							
					});
				}
				shadoWindow.sel = this.id;
			}
		});
	};

	var mkTitle = function(txt) {
		var divID = 'collection' + txt;

		return $jConstruct('div', {
			id: divID,
			class: 'draggableExclude', //makes it so that the draggable function will exclude this div.
			text: txt, //This is the collection title text that the user will see within the tile.
		}).css({
			'border': '1px solid black',
			'background-color': 'gray',
			//'width': '260px',
			'text-align': 'center',
			'border-top-right-radius': '4px',
			'border-top-left-radius': '4px',
			'cursor': 'default', //so that it won't turn into text pointer where there is text.
		}).event('click', function() {
			if(shadoWindow.sel != this.id) {
				if(shadoWindow.sel != 'unassigned') {
					$('#'+shadoWindow.sel).css({
						'-moz-box-shadow': '0 0 10px white',
						'-webkit-box-shadow': '0 0 10px white',
						'box-shadow': '0 0 10px white',							
					});
				}
				var parentID = 'collectionContainer' + txt;
				$('#'+parentID).css({ //turns off the mouse-over glow when object is no longer being moused-over.
					'-moz-box-shadow': '0 0 10px orange',
					'-webkit-box-shadow': '0 0 10px orange',
					'box-shadow': '0 0 10px orange',
				});
				fabCanvas.deactivateAll(); //setActiveGroup offset bug will happen without using this.
				if(txt !== 'unassigned') {
					var test = projFuncs.addGroup(txt);
					fabCanvas.setActiveGroup(test);
					shadoWindow.sel = parentID;
				}
				fabCanvas.renderAll();
			}
		});
	};

	//adds an object to the tiles array.
	var addObj = function(txt) {
		if(!contains(txt, 'collection')) {
			var indx = tiles.length; //Will add to the end of the 'tiles' array.
			shadoWindow.sel = 'unassigned';

			var collectionContainer = mkContainer(txt); //container that contains all objects for the tile.
			var tileTitle = mkTitle(txt); //titlebar of each collection.

			var dropFuncs = {};

			/*Allows the user to rename the collection title.*/
			dropFuncs.renameCollection = function(id, type) {
				var obj = arrdb.get(id);
				obj.type = 'textbox';
				obj.refresh(type);
				$('#'+id).select();
				obj.event('keypress', function(e) {
					if(e.which == 13) {
						obj.text = $('#'+id).val();
						obj.type = 'div';
						obj.refresh(type);
					}
				});
				
			};

			/*Allows the user to change the color of the collection status bar.*/
			dropFuncs.changeColor = function(id, type) {
				console.log('will change color.');
			};

			/*Allows the user to bring the collection up in the z-index.*/
			dropFuncs.layerUp = function(id, type) {
				console.log('will layer collection up.');
			};

			/*Allows the user to bring the collection down in the z-index.*/
			dropFuncs.layerDown = function(id, type) {
				console.log('will layer collection down.');
			};

			var collectionSettingsBtn = new toadFish.drop($jConstruct('img', {
				src: './css/images/settingsGear.png',
				class: 'dropdown',
			}));
			collectionSettingsBtn.addOption({
				name: 'rename',
				event: {
					type: 'click',
					func: function() {
						dropFuncs.renameCollection('collection' + txt, 'prepend');
					},
				},
			});
			collectionSettingsBtn.addOption({
				name: 'color',
				event: {
					type: 'click',
					func: function() {
		                var txt = arrdb.get(this.id).text;
		                console.log(txt, 'was clicked!');
		                //console.log(this);
		                console.log(arrdb.get(this.parent));
					},
				},
			});
			collectionSettingsBtn.addOption({
				name: 'layer up',
				event: {
					type: 'click',
					func: function() {
                		var txt = arrdb.get(this.id).text;
                		console.log(txt, 'was clicked!');
   					},
				},
			});
			collectionSettingsBtn.addOption({
				name: 'layer down',
				event: {
					type: 'click',
					func: function() {
		                var txt = arrdb.get(this.id).text;
		                console.log(txt, 'was clicked!');
					},
				},
			});

            		
			collectionContainer.addChild(tileTitle.addChild(collectionSettingsBtn));
			tiles[indx] = collectionContainer;
		};
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

		//icon for identifying if image or text.
		arr2D[0][0] = $jConstruct('img', {
			src: source,
		}).css({
			'width': '20px',
			'height': '20px',
			'float': 'left',
		});

		//the layer up, and layer down arrows.
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

		//determines if the tile will display the given name of the object,
		//or the id.
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

		//shadoWindow object tile.
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
			var tmp = $('div[name="canvasTile"]');
			for(var i = 0; i < tmp.length; ++i) { //clear the color for everything.
				arrdb.get(tmp[i].id).css({
					'background-color': 'white',
				});
			}
			var activeObject = fabCanvas.getActiveObject();
			var current = projDB.get(arrdb.get(this.id).linkedto);
			if(activeObject !== current) { //If the clicked object is not already selected.
				fabCanvas.deactivateAll();
				fabCanvas.setActiveObject(current);
				$('#'+this.id).css({
					'background-color': 'gray',
				});
			}
			
			//check if the properties window is open right now.
			if(arrdb.get('cbMain')) {
				propertiesWindow.refresh(); //refresh propertiesWindow.
				packageManager.refresh(); //refresh the packageManager.
			}

		}).css(tileStyle);

		//button that starts the editing of the name of the object.
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


		//opens an object edit window.
		arr2D[0][4] = $jConstruct('img', {
			//linkedto: arr2D[0][2].id,
			src: './css/images/tasks.png',
		}).event('click', function() {
			//template.customColorbox();  //this opens the object settings/manipulations window.
			propertiesWindow.load(); //load the window that contains craigs Shadow Tool.
		}).css({
			'width': '20px',
			'height': '20px',
			'float': 'right',
			'cursor': 'pointer',
		});

		//checks for if a collection is defined.
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
	
	//sidebar in the shadoWindow.
	var toolSidebar = $jConstruct('div').css({
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

	//settings gear button.
	var settingsBtn = new toadFish.drop($jConstruct('img', {
		src: './css/images/settingsGear.png',
		class: 'dropdown',
	}).css(toolButtonCss)).css({ //adjust fit
		'padding-top': '5px',
		'padding-bottom': '5px',
		'float': 'left',
		'clear': 'left',
	});
	settingsBtn.addOption({
		name: 'undo',
		event: {
			type: 'click',
			func: function(input) {
				var txt = arrdb.get(input.currentTarget.id).text;
				console.log(txt, 'was clicked!');
			}
		}
	}).css({
		'width': '100px',
	});
	settingsBtn.addOption({
		name: 'redo',
		event: {
			type: 'click',
			func: function(input) {
				var txt = arrdb.get(input.currentTarget.id).text;
				console.log(txt, 'was clicked!');
			}
		}
	}).css({
		'width': '100px',
	});
	settingsBtn.addOption({
		name: 'refresh',
		event: {
			type: 'click',
			func: function(input) {
				shadoWindow.refresh(projDB.query({
	                where: {
	                    collection: function(input) {
	                        return input != undefined;
	                    },
	                }
	            }));
			}
		}
	});
	settingsBtn.addOption({
		name: 'window settings',
		event: {
			type: 'click',
			func: function(input) {
				var txt = arrdb.get(input.currentTarget.id).text;
				console.log(txt, 'was clicked!');
			}
		}
	}).css({
		'width': '100px',
	});



	toolSidebar.addChild(settingsBtn);
	/*end drop down*/

	//assembles canvas data, in order to save, and reconstruct later.
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

	//save button to save the canvas.
	toolSidebar.addChild($jConstruct('img', {
		src: './css/images/save.png',
	}).event('click', function() {
		//handle clicking the save button.
		console.log('saveData:', getCanvasData());
	}).css(toolButtonCss));

	//delete the current active object.
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

	//Insert a new object into the canvas.
	var nwObjBtn = new toadFish.drop($jConstruct('img', {
		src: './css/images/newButton.png',
		class: 'dropdown',
	}).css(toolButtonCss)).css({ //adjust fit
		'padding-bottom': '10px',
		'float': 'left',
		'clear': 'left',
	});

	//add a text object to the canvas.
	nwObjBtn.addOption({ 
		name: 'new text',
		event: {
			type: 'click',
			func: function(input) {
		        projFuncs.addText(fabCanvas, 'New Text', {
		            fontSize: 20,
		            fontFamily: 'Arial',
		            fill: 'Black',
		        }).done(function(t) {
		        	shadoWindow.reload(projDB.query({
		                where: {
		                    collection: function(input) {
		                        return input != undefined;
		                    },
		                }
		            }));
		            fabCanvas.setActiveObject(t); //select object after it has loaded.
		        });
			},
		},
	});

	nwObjBtn.addOption({
		name: 'new image',
		event: {
			type: 'click',
			func: function(input) {
				console.log(input.currentTarget.id);
			},
		},
	});

	toolSidebar.addChild(nwObjBtn);


	//options for managing collections aka 'groups.'
	var collectionBtn = new toadFish.drop($jConstruct('img', {
		src: './css/images/box.png',
		class: 'dropdown',
	}).css(toolButtonCss)).css({ //adjust fit
		'padding-bottom': '10px',
		'float': 'left',
		'clear': 'left',
	});

	collectionBtn.addOption({
		name: 'view packages',
		event: {
			type: 'click',
			func: function(input) {
				/*$db.getPackageList(479).done(function(data) {
					console.log(data);
				});*/
				packageManager.load(credentials.PkLstID);
			},
		},
	});

	collectionBtn.addOption({
		name: 'new group',
		event: {
			type: 'click',
			func: function(input) {
				console.log(input.currentTarget.id);
			},
		}
	}).css({
		'width': '100px',
	});

	collectionBtn.addOption({
		name: 'delete group',
		event: {
			type: 'click',
			func: function(input) {
				console.log(input.currentTarget.id);
			}
		}
	}).css({
		'width': '100px',
	});

	toolSidebar.addChild(collectionBtn);
	
	toolSidebar.appendTo('#shadoWindow').state.done(function() {
		dfd.resolve(structure);
	});
	
	//return structure;
	return dfd.promise();
};