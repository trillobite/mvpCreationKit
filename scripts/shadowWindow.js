
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
		width: '388',
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

	//find all the objects in shadoCollection database.
	var getElems = function() {
		return projFuncs.filterArr(shadoCollection.db.query({
			where: {
				id: function(input) {
					return input ? true : false;
				},
			},
		}));
	};

	var collDB = getElems();

	//remove all of the objects from the shadoCollection database.
	for(var i = 0; i < collDB.length; ++i) {
		shadoCollection.db.remove(collDB[i].id); //remove by the id.
	}

	var clr = function(elems) { //remove all jsonHTML objects from the DOM.
		for(var i = 0; i < elems.length; ++i) {
			if(!elems[i].length) {
				//arrdb.remove(elems[i].id); //TypeError: t is undefined
				//elems[i].remove();
				elems[i].remove({
                    db: true, //to remove object from micronDB.
                    all: true, //to remove all child objects contained in the jsonHTML object.
                });
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

	if(arrdb.get('shadoWindow')) {
		arrdb.get('shadoWindow').remove({
			db: true,
			all: true,
		});
	}

	$jConstruct('div').appendTo('lCboxLoadedContent');

	shadoWindow.build(coll).done(function() {
		//shadoWindow.removeDuplicates(); //remove all duplicate shadoWindow objects.
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

shadoWindow.collectionObj = shadoCollection;

shadoWindow.removeDuplicates = function() {
		(function() {
		var arr = [];
		var arrContains = function(input) {
			for(var i = 0; i < arr.length; ++i) {
				if(arr[i].linkedto == input) {
					return true;
				}
			}
			return false;
		};
		var tmp = arrdb.query({ //find all of the shadoWindow tiles.
			where: {
				$and: {
					linkedto: function(input) {
						return input ? true : false;
					}, 
					collectionName: function(input) {
						return input ? true : false;
					},
				},
			},
		});
		var cntr = 0; //counts how many objects are removed.
		var tmp = projFuncs.removeDuplicates(projFuncs.filterArr(tmp));
		for(var i = 0; i < tmp.length; ++i) {
			if(arrContains(tmp[i].linkedto)) {
				tmp[i].remove({
					all: true,
					db: true,
				});
				cntr++; //count the removal.
			} else {
				arr[arr.length] = tmp[i];
			}
		}
		console.log('removed:', cntr);
		for(var i = 0; i < arr.length; ++i) {
			arr[i].refresh();
		}
	})();
};

//loads everything INTO colorbox (load colorbox first).
shadoWindow.build = function(coll) {

	coll = projFuncs.filterArr(coll); //filter out the duplicates, and remove arrays.

	console.log('coll:', coll, coll.length);
	var dfd = new $.Deferred();

	/*
		getCollection
			Returns the collection object for shadoWindow if it has been
			created. Returns false if object not found.
		inputs:
			tmp: a fabricJS object.
	*/
	var getCollection = function(collName) {
		var check = shadoCollection.db.query({
			where: {
				collection: function(input) { //does the name match tmp?
					return collName == input ? true : false;
				},
			},
		});
		if(check.length) { //did it find something?
			return check.length ? check[0] : check; //filter the array out.
		}
		return false; //found nothing.
	};

	/*
		addToCollection
			Adds objects to a collection. If a collection does not exist, it makes
			one.
		inputs:
			obj: the fabricJS object.
			collName: name of the collection.
	*/
	var addToCollection = function(obj, collName) {
		var collection = getCollection(collName);
		if(collection) {
			collection.addCanvObj(obj);
		} else {
			var nwCollection = new shadoCollection.build(collName);
			nwCollection.addCanvObj(obj);
		}
	};

	/*
		sort
			sorts all of the canvas objects that are given to it, and places them
			into collections.
		inputs:
			arrColl: typically fabCanvas._objects.
	*/
	var sort = function(arrColl) {
		arrColl = projFuncs.filterArr(arrColl); //filter out the duplicates, and remove arrays.
		console.log('arrColl:', arrColl, arrColl.length);
		for(var i = 0; i < arrColl.length; ++i) {
			if(!arrColl[i].hasOwnProperty('collection')) {
				addToCollection(arrColl[i], 'unassigned');
			} else {
				addToCollection(arrColl[i], arrColl[i].collection);
			}
		}
	};

	//set all canvas objects into collections.
	//sort(filterArr(coll));
	sort(fabCanvas._objects);

	console.log('tiles:', shadoCollection.db);
	
	//alternative to toadFish structure.
	var structure = $jConstruct('div').css({
		'overflow': 'auto', //so that the scroll bars will appear in this div, and not the outer one.
		'padding': '5px',
		//'border': '1px solid black',
		'display': 'inline block',
		'font-family': 'arial',
		'width': '295px',
		'height': '320px',
	});

	/*
		place all of the collections into the structure.
	*/
	var myCollections = projFuncs.removeDuplicates(shadoCollection.getAllColl());
	for(var i = 0; i < myCollections.length; ++i) {
		//the collections are already a jsonHTML object, so just add them.
		structure.addChild(myCollections[i]);
	}
	
	//Note: structure is appended later at the bottom!!!!!!!

	//sidebar in the shadoWindow.
	var toolSidebar = $jConstruct('div').css({
		'float': 'right',
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
		class: 'draggableExclude',
	}).event('click', function() {
        $('#loadSpinner').show();
		var canvData = JSON.stringify(projFuncs.getCanvasData());
   		var PricingFormCanvasID = projData.availCanv._Canvases[parseInt(canvSelected)]._indxPhotographerPackagePriceCanvasID;
   		var PhotographerID = credentials.PhotographerID;
   		$db.svCanJson(canvSelectedID, PhotographerID, canvData).done(function(data) {
	        console.log('Done:', data);
	        setTimeout(function() {
	        	$('#loadSpinner').fadeOut('slow');
	    	}, 500); //fades out after wating 500 milliseconds.
	    }).fail(function(error) {
	    	console.log(error);
		});	
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
				var nwCollection = new shadoCollection.build('default');
				projFuncs.addGroup('default'); //create fabricJS group, and hash it.
				structure.addChild(nwCollection);
				structure.refresh();
				//nwCollection.appendTo(structure.id);
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
	}); //append the sidebar first.

	structure.appendTo('#shadoWindow'); //append the collections second.
	
	//return structure;
	return dfd.promise();
};