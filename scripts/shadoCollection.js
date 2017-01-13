/*
	Description:
		Generates a new collection for the Shadow Window, giving a place
		to store all canvas objects which are to be kept in collections.
	Inputs: 
		None
	Use: 
		var myCollection = new shadoCollection.build('collectionName');
		myCollection.addCanvObj(fabjsObj);
		myCollection.appendTo('#divID');
*/
shadoCollection = {}; //shadoCollection namespace.
shadoCollection.db = new micronDB();
shadoCollection.objTile = {};

/*
	Description:
		Allows editing the name of the tile.
	Inputs:
		linkedID:
			The ID of the jsonHTML tile within the shadoCollection.
*/
shadoCollection.objTile.editName = function(linkedID) {
	return $jConstruct('img', {
		linkedto: linkedID,
		src: './css/images/photoshop.png',
	}).event('click', function() { //starts the edit process.
		console.log(this);
		var currObj = arrdb.get(arrdb.get(this.id).linkedto); //get the parent object.
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
};


/*
	Description:
		Produces the arrows for controlling fabricJS objects on the canvas 
		to properly layer over one another.
	obj: 
		Copy of the fabricJS object this object is going to control.
*/
shadoCollection.objTile.makeArrows = function(obj) {
	var arrows = []; //single dimensional array for toadFish.

	/*
		indx: 		which arrow to change?
		delay: 		how long before switching icon?
		imageName: 	what is the name of the image within this directory?
	*/
	var imageSwap = function(indx, delay, imageName) {
		var dfd = new $.Deferred();
		var swap = function() {
			var thisArrowObject = arrdb.get(arrows[indx].id);
			thisArrowObject.src = './css/images/' + imageName;
			setTimeout(function() {
				thisArrowObject.refresh();
				dfd.resolve();
			}, delay);
		};
		swap();
		return dfd.promise();
	};

	//Layer Up Arrow
	arrows[0] = $jConstruct('img', { //arrow naturally pointing up.
		src: './css/images/blackArrow.png',
		boundto: obj.id,
		class: 'draggableExclude',
	}).css({
		'width': '20px',
		'height': '10px',
		'float': 'left',
		'cursor': 'pointer',
	}).event('mousedown', function() {
		var obj = this.id;
		imageSwap(0, 0, 'whiteArrow.png').done(function() {
			var dfd = new $.Deferred();
			var exec = function(id) {
				var canvObj = projDB.get(arrdb.get(id).boundto);
				if(canvObj.hasOwnProperty('tmpIndx')) {
					++canvObj.tmpIndx;
				} else {
					canvObj.tmpIndx = 0;
				}
				canvObj.moveTo(canvObj.tmpIndx);
			};
			exec(obj);
			return dfd.promise();
		}); //swaps image to the white version.
	}).event('mouseup', function() {
		imageSwap(0, 25, 'blackArrow.png'); //25ms delay to switch back image.
	});

	//Layer Down Arrow
	arrows[1] = $jConstruct('img', { //same arrow image, just flipped to point down
		src: './css/images/blackArrow.png',
		boundto: obj.id,
		class: 'draggableExclude',
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
		var obj = this.id;
		imageSwap(1, 0, 'whiteArrow.png').done(function() {
			var dfd = new $.Deferred();
			var exec = function(id) {
				var canvObj = projDB.get(arrdb.get(id).boundto);
				if(canvObj.hasOwnProperty('tmpIndx')) {
					--canvObj.tmpIndx;
				} else {
					canvObj.tmpIndx = 0;
				}
				canvObj.moveTo(canvObj.tmpIndx);
			};
			exec(obj);
			return dfd.promise();
		}); //swaps image to the white version.
	}).event('mouseup', function() {
		imageSwap(1, 25, 'blackArrow.png'); //25ms delay to switch back image.
	});

	//return a toadFish grid that contains everything.
	return $jConstruct('div').addChild(toadFish.structure(arrows, 'imgArrows')).css({
		'float': 'left',
	});
};

	//opens the properties window for a canvas object.
shadoCollection.objTile.openProperties = function() {
	return $jConstruct('img', {
		//linkedto: arr2D[0][2].id,
		src: './css/images/tasks.png',
		class: 'draggableExclude',
	}).event('click', function() {
		//template.customColorbox();  //this opens the object settings/manipulations window.
		propertiesWindow.load(); //load the window that contains craigs Shadow Tool.
	}).css({
		'width': '20px',
		'height': '20px',
		'float': 'right',
		'cursor': 'pointer',
	});
};

/*
	Description:
		This is the tile that is actually seen within the shadow window.This 
		is the tile that the actor will click on, in order to select a canvas 
		object.
	name: 
		The text that will show for the tile.
	objStyles: 
		The css styles for the tile.
*/
shadoCollection.objTile.makeTile = function(name, obj) {
	return  $jConstruct('div', {
		text: name,
		shadoType: 'shadoWindowTile',
		linkedto: obj.id,
		name: 'canvasTile',
		class: 'draggableExclude',
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

	}).css({			
		'float': 'left',
		'cursor': 'default',
		//'border': '1px solid black',
		'width': '195px',
	});
};

/*
	Description:
		Creates a jsonHTML img object, which is used as a marker in
		order to tell the actor what kind of fabricJS object is being
		represented.
	Inputs:
		obj: A fabricJS object from the canvas, either text or image. 
*/
shadoCollection.objTile.buildIcon = function(obj) {
	return $jConstruct('img', {
		src: (function() { //determine which image to use.
			if(obj.type == 'image') {
				return './css/images/inkscape.png';
			} else {
				return './css/images/word.png';
			}
		})(),
	}).css({
		'width': '20px',
		'height': '20px',
		'float': 'left',
	});
};

/*
	Description:
		Builds/assembles an "object-tile" which represents an object 
		on the fabricJS canvas.
	Inputs:
		obj: A fabricJS canvas object.
		thisObject: the current objTile.
*/
shadoCollection.objTile.build = function(obj) {
	var thisCollection = shadoCollection.objTile;

	var arr2D = toadFish.create2DArray(1); //toadFish structure, 2D array.

	//console.log('canvObjAdd:', obj);

	//icon for identifying if image or text.
	arr2D[0][0] = thisCollection.buildIcon(obj);

	//the layer up, and layer down arrows.
	arr2D[0][1] = thisCollection.makeArrows(obj);

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
		
	//shadoWindow object tile.
	arr2D[0][2] = thisCollection.makeTile(objText(), obj);

	//button that starts the editing of the name of the object.
	arr2D[0][3] = thisCollection.editName(arr2D[0][2].id);

	//opens an object edit window.
	arr2D[0][4] = thisCollection.openProperties();

	//make sure the main collection div knows what it is linked to.
	myCollection = toadFish.structure(arr2D, obj.collection+'grid'+obj.id);
	myCollection.linkedto = obj.id;

	//add to the proper collection container.
	return myCollection;	
};

/*
	Description:
		Gets all of the collections or "tiles," that are currently in use by 
		shadoCollection.
	Inputs:
		none.
	Returns:
		single-dimensional array of shadoCollection collection objects.
*/
shadoCollection.getAllColl = function() {
	var collArr = [];

	//micronDB queries do not always return a single dimensional array.
	var filter = function(arr) {
		for(var i = 0; i < arr.length; ++i) {
			if(arr[i].length) {
				filter(arr[i]); //if object is actually an array, filter it too.
			} else {
				collArr[collArr.length] = arr[i];
			}
		}
	};
		
	//we want all of the collections!
	filter(shadoCollection.db.query({
		where: {
			id: function(input) { //micronDB will insert the id into 'input.'
				return input ? true : false; //if it has an id, return true.
			},
		},
	}));

	return collArr; //return all of the collections in a 1D array.
};

/*var getGroupObjsTesting = function(collectionName) {
	//console.log(this.db.db.length);
	var obj = [];
	var fabJSObjs = projDB.query({ //find all canvas objects belonging to this collection.
		where: {
			collection: collectionName,
		},
	});
	for(var i = 0; i < fabJSObjs.length; ++i) {
		var tileObj = arrdb.query({ //find all shadoCollection elements linked to these objects.
			where: {
				linkedto: fabJSObjs[i].id,
			}
		});
		if(tileObj.length > 1) {
			console.log('duplicates!', tileObj);
		}
		if(tileObj.length) {
			obj[obj.length] = tileObj[0];
		} else {
			console.log('not found!', fabJSObjs[i].id);
		}
	}

	return obj; //all fabricJS objects for this collection.
};*/

/*
	getGroupObjs
		Description: Finds all of the jsonHTML tile-objects that belong to 
		the defined group, and returns it.
	Requires:
		collectionName: The group name the fabricJS objects belong to.
*/
shadoCollection.getGroupObjs = function(collectionName) {
	//console.log(this.db.db.length);
	var obj = [];
	var fabJSObjs = projDB.query({ //find all canvas objects belonging to this collection.
		where: {
			collection: collectionName,
		},
	});
	for(var i = 0; i < fabJSObjs.length; ++i) {
		var tileObj = arrdb.query({ //find all shadoCollection elements linked to these objects.
			where: {
				linkedto: fabJSObjs[i].id,
			}
		});
		if(tileObj.length > 1) {
			console.log('duplicates!', tileObj);
		}
		if(tileObj.length) {
			obj[obj.length] = tileObj[0];
		} else {
			console.log('not found!', fabJSObjs[i].id);
		}
	}

	return obj; //all fabricJS objects for this collection.
	//return getGroupObjsTesting(collectionName);
};

/*
	getCanvGroupObjs
		Description:
			Finds all of the fabricJS objects that belong to the
			defined group, and returns it.
		Requires:
			collectionName: string, the name of the group/collection.
*/
shadoCollection.getCanvGroupObjs = function(collectionName) {
	var tmpArr = projDB.query({
		where: {
			collection: collectionName,
		},
	});
	if(tmpArr.length) { //check if something was found.
		return tmpArr;
	}
	return false; //return nothing, if nothing is found.
};

/*
	getCollection
		Description:
			Finds the container that holds the specified 
			collection type fabricJS objects within the
			shado-window.
		Inputs:
			collectionName: The name of the collection/group.
*/
shadoCollection.getCollection = function(collectionName) {
	var tmpArr =  arrdb.query({
		where: {
			$and: {
				shadoType: 'collectionContainer', //the type of object searching for.
				collection: collectionName, //In this collection.
			},
		},
	});
	if(tmpArr.length) { //check if something was found.
		return tmpArr[0]; //return only the first object from the query.
	}
	return false; //return nothing, if nothing is found.
};

/*
	getTitleHeader
		Description:
			Gets the title header "tile" within the jsonHTML
			collection, so that the title can be changed.
		Inputs:
			collectionName: The name of the collection/group.
*/
shadoCollection.getTitleHeader = function(collectionName) {
	var tmpArr = arrdb.query({
		where: {
			$and: {
				shadoType: 'header', //the type of object searching for.
				collection: collectionName, //In this collection.
			},
		},
	});
	if(tmpArr.length) { //check if something was found.
		return tmpArr[0] //return only the first object from the query.
	}
	return false; //return nothing, if nothing is found.
};

/*
	need to make sure that the title header changes it's collection definition
	with the rest of the objects.
*/

/*
	Description:
		Creates a collection for the shadoWindow, in such a way that it can 
		accept fabricJS objects to be added into the collection.
	inputs: 
		collectionName - name of the collection to show in the collection title.
*/
shadoCollection.build = function(collectionName) {
	var collection = {};
	collection.name = undefined; //So I can store the name of this collection for later.
	collection.thisObject = undefined; //So the generated object from compose, will be available for later.S

	/*
		Outputs the required css to make a div glow a specified color.
		Used in this application to handle the mouseover glow effects.
	*/
	collection.glow = function(color) { //returns css to make object produce glowing shadow.
		return {
			'-moz-box-shadow': '0 0 10px ' + color,
			'-webkit-box-shadow': '0 0 10px ' + color,
			'box-shadow': '0 0 10px ' + color,
		}
	};

	/*
		This is the container/shell that is used to hold all of the
		jsonHTML objects, which represent a collection of items on
		the canvas.
	*/
	collection.mkContainer = function(txt) {
		//var divID = 'collectionContainer' + txt;

		return $jConstruct('div', { //the tile to add.
			//id: divID,
			shadoType: 'collectionContainer',
			collection: txt,
			class: 'draggableExclude', //makes it so that the draggable function will exclude this div.
		}).css({
			//'border': '1px solid black',
			'border-right': '1px dotted black',
			'border-left': '1px dotted black',
			'border-bottom': '1px dotted black',
			'border-radius': '4px',
			'display': 'inline-block',
			'float': 'left',
		}).event('mouseover', function() {
			if(shadoWindow.sel != this.id) {
				$('#'+this.id).css(collection.glow('blue')); //makes the collection shadow glow during mouse-over.
			}
		}).event('mouseout', function() {
			if(shadoWindow.sel != this.id) {
				$('#'+this.id).css(collection.glow('white')); //turns off the mouse-over glow when object is no longer being moused-over.
			}
		}).event('click', function() {
			if(shadoWindow.sel != this.id) {
				if(shadoWindow.sel != 'unassigned') {
					$('#'+shadoWindow.sel).css(collection.glow('white'));
				}
				shadoWindow.sel = this.id;
			}
		});
	};

	/*
		Displays the title of the collection.
	*/
	collection.mkTitle = function(txt) {
		//var divID = 'collection' + txt;
		
		return $jConstruct('div', {
			//id: divID,
			collection: txt,
			shadoType: 'header',
			class: 'draggableExclude', //makes it so that the draggable function will exclude this div.
			name: 'header', //defines what it is for filtering later on.
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
			var thisObj = this;
			if(shadoWindow.sel != thisObj.id) {
				if(shadoWindow.sel != 'unassigned') {
					$('#'+shadoWindow.sel).css(collection.glow('white'));
				}

				var parentID = thisObj.parent;

				//var parentID = shadoCollection.getCollection(txt).id;
				$('#'+parentID).css(collection.glow('orange')); //turns off the mouse-over glow when object is no longer being moused-over.
				fabCanvas.deactivateAll(); //setActiveGroup offset bug will happen without using this.
				if(thisObj.collection !== 'unassigned') {
					var test = projFuncs.addGroup(thisObj.collection);
					fabCanvas.setActiveGroup(test);
					shadoWindow.sel = parentID;
				}
				fabCanvas.renderAll();
			}
		});
	};

	//completes the collection object.
	collection.compose = function(txt) {

		collection.name = txt; //store the name of this collection.

		var collectionContainer = collection.mkContainer(txt); //container that contains all objects for the tile.
		var tileTitle = collection.mkTitle(txt); //titlebar of each collection.

		var dropFuncs = {};

		/*Allows the user to rename the collection title.*/
		dropFuncs.renameCollection = function(collectionName, type) {
			var obj = shadoCollection.getTitleHeader(collectionName);
			var id = obj.id;
			console.log('renameCollection:', id, type);
			//var obj = arrdb.get(id);
			obj.type = 'textbox';
			obj.refresh(type);
			$('#'+id).select();
			obj.event('keypress', function(e) {
				if(e.which == 13) {
					var nwCollName = $('#'+id).val();
					if(obj.text != nwCollName) {
						var collContainer = shadoCollection.getCollection(obj.text);
						if(collContainer) { //if the collection container is found.
							collContainer.collection = nwCollName; //change the collection defined value.
						} else {
							console.log('err: collection not found:', collContainer);
						}
						var collObjArr = shadoCollection.getGroupObjs(obj.text);
						var collHeader = shadoCollection.getTitleHeader(obj.text);
						var canvObjArr = shadoCollection.getCanvGroupObjs(obj.text);
						console.log('rename collection:', obj.text);
						console.log(collObjArr.length && canvObjArr.length);
						obj.text = nwCollName; //change the name of the collection.
						if(collObjArr.length && canvObjArr.length) { //checks if elements were found.
							for(var i = 0; i < collObjArr.length; ++i) {
								collObjArr[i].collection = obj.text; //change the name of the collection with every fabricJS object.
							}
							for(var i = 0; i < canvObjArr.length; ++i) {
								canvObjArr[i].collection = obj.text;
							}
						}
						if(collHeader) {

						}
					}
					obj.type = 'div';
					obj.refresh(type);
				}
			});
		};

/*
	need to revise the way tiles produce their id's. Instead, it is best to add a
	collection linked to property to better produce queries.
*/

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
					dropFuncs.renameCollection(txt, 'prepend');
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
		shadoCollection.db.hash(collectionContainer);
		
		return collectionContainer;
	};
	
	/*
		returnObj will be the collection object with functions that the actor
		can utilize in order to affect the objects on the fabricJS canvas.
	*/
	collection.thisObject = collection.compose(collectionName); //generate the collection, and store it for future reference.
	returnObj = collection.thisObject; //going to return the jsonHTML collection object, and attach functions to control it.
		
	/*
		addCanvObj
			Description: 
				Adds a fabricJS object into this collection, and displays this change.
			inputs: 
				fabjsObj - Complete fabricJS object from the canvas to add to the 
				collection.
	*/
	returnObj.addCanvObj = function(fabjsObj) {
		fabjsObj.collection = this.collection; //redefine fabricJS object collection assigned name.
		this.addChild(shadoCollection.objTile.build(fabjsObj)); //add the new tile.
	};

	returnObj.filterID = function(inputID) {
		var tmp = inputID.substring(0,1);
		if(tmp == "#") {
			return inputID.substring(1,inputID.length);
		}
		return inputID;
	};

	/*
		addExistingTile
			Description:
				Takes a tile which was created for a different shadoWindow collection,
				and allows for the ability to add it to this shadoWindow collection.
			Inputs:
				shadoTile: The shadoWindow collection tile from another shadoWindow 
					collection, to add to this collection. 
	*/
	returnObj.addExistingTile = function(shadoTile) {
		//find the canvas object that this tile is linked to.
		//console.log('addExistingTile: this:', this);
		var findObj = function(id, arr) { //trying to find duplicate that shows up when adding same tile back to original collection.
			var tmp = [];
			for(var i = 0; i < arr.length; ++i) {
				if(arr[i].id == id) {
					tmp[tmp.length] = arr[i];
				}
			}
		};
		console.log('addExistingTile: findObj:', findObj(shadoTile.id, this.children));
		var obj = shadoTile; //backup the shadoTile.
		if(projDB.get(arrdb.get(shadoTile.id).linkedto)) { //does it exist?
			projDB.get(arrdb.get(shadoTile.id).linkedto).collection = this.collection; //set the canvas object to this collection.
			shadoTile.remove({
				db: true, //also remove from arrdb.
				all: true, //removes all jsonHTML objects to prevent a memory leak.
			}); //remove the shadoTile from the other collection.
			console.log('addExistingTile:', document.getElementById(shadoTile.id));
			//console.log('addExistingTile: this:', this);
			obj.collectionName = this.collection + 'grid' + obj.linkedto;
			arrdb.hash(obj); //make sure that it is in the db right now.
			arrdb.get(this.filterID(obj.parent)).addChild(obj);
			this.addChild(obj); //add tile to this collection.
			this.refresh();
		} else {
			console.log('ERROR: function: addExistingTile: Could not find canvas object.', shadoTile);
		}
	};

	/*
		getGroupObjects
			Description:
				Gets all of the fabricJS objects on the canvas that belongs to this
				collection.
			Inputs:
				none.
	*/
	returnObj.getGroupObjects = function() {
		//console.log(this.children);
		return shadoCollection.getGroupObjs(this.collection);
		//need to get all of the fabricJS objects, and change their collection name.
	};

	/*
		removeCanvObj
			Description:
				Removes a fabricJS object from this collection, and displays this change.
			Inputs:
				fabjsObj - Complete fabricJS object from the canvas to remove from the 
				collection.
	*/
	returnObj.removeCanvObj = function(fabjsObj) {

	};

	/*
		removeObj
			Description:
				Removes a canvas object from the current collection, and adds it to another.
			Inputs:
				id: jsonHTML id of the object to remove from the collection.
	*/
	returnObj.removeObj = function(id) {

	};

	return returnObj;
};

/*
             )
c            (
o        )   )
p        (           v1.3.1
y    .---------------------.
r    |        _____        |___      
i    |     .'`_,-._`'.      __ \
g    |    /  ( [ ] )  \    |  ||
h    |   /.-""`( )`""-.\   |  ||
t    |  ' <'```(.)```'> '  | _||
     |    <'```(.)```'>    |/ _/
2    |     <'``(.)``'>      ./
0    |      <``\_/``>      |
1    |       `'---'`       |
6    \github.com/trillobite/              
       \_________________/      I like my code black,
                                   like my coffee.
*/