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
		Allows for the editing of the name of a tile within the shadoCollection.
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
shadoCollection.objTile.makeTile = function(name,obj) {
	return  $jConstruct('div', {
		text: name,
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

	}).css({			
		'float': 'left',
		'cursor': 'default',
		//'border': '1px solid black',
		'width': '195px',
	});
};


shadoCollection.objTile.build = function(obj) {
	var arr2D = toadFish.create2DArray(1); //toadFish structure.

	var source = (function() { //determine which image to use.
		if(obj.type == 'image') {
			return './css/images/inkscape.png';
		} else {
			return './css/images/word.png';
		}
	})();
};

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





	//opens the properties window for a canvas object.
	var openProperties = function() {
		return $jConstruct('img', {
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
	};

	/*
		convert for single canvas object addition to collection.
	*/
	var canvObjAdd = function(obj) {
		console.log('canvObjAdd:', obj);
		//create a 2D
		

		
		//icon for identifying if image or text.
		arr2D[0][0] = $jConstruct('img', {
			src: source,
		}).css({
			'width': '20px',
			'height': '20px',
			'float': 'left',
		});

		//the layer up, and layer down arrows.
		arr2D[0][1] = layeringArrows(collection.thisObject);

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
		arr2D[0][2] = objTile(objText(), obj);

		//button that starts the editing of the name of the object.
		arr2D[0][3] = editNameButton(arr2D[0][2].id);

		//opens an object edit window.
		arr2D[0][4] = openProperties();

		//add to the proper collection container.
		collection.thisObject.addChild(toadFish.structure(arr2D, obj.collection+'grid'));
	};

	/*
		This is the container/shell that is used to hold all of the
		jsonHTML objects, which represent a collection of items on
		the canvas.
	*/
	collection.mkContainer = function(txt) {
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
					$('#'+shadoWindow.sel).css(collection.glow('white'));
				}
				var parentID = 'collectionContainer' + txt;
				$('#'+parentID).css(collection.glow('orange')); //turns off the mouse-over glow when object is no longer being moused-over.
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

	//completes the collection object.
	collection.compose = function(txt) {

		collection.name = txt; //store the name of this collection.

		var collectionContainer = collection.mkContainer(txt); //container that contains all objects for the tile.
		var tileTitle = collection.mkTitle(txt); //titlebar of each collection.

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
		Description: 
			Adds a fabricJS object into this collection, and displays this change.
		inputs: 
			fabjsObj - Complete fabricJS object from the canvas to add to the 
			collection.
	*/
	returnObj.addCanvObj = function(fabjsObj) {
		fabjsObj.collection = collectionName; //so it will add to this collection.
		canvObjAdd(fabjsObj);
	};

	/*
		Description:
			Removes a fabricJS object from this collection, and displays this change.
		Inputs:
			fabjsObj - Complete fabricJS object from the canvas to remove from the 
			collection.
	*/
	returnObj.removeCanvObj = function(fabjsObj) {

	};

	/*
		Description:
			Removes the collection, and unlinks the canvas fabricJS objects
			from the collection.
		Inputs:
			None.
	*/
	returnObj.remove = function() {
		//basic deletion process. Does not remove all child objects in the collection.
		shadoCollection.db.get('collectionContainer' + collection.name).remove();
		shadoCollection.db.remove('collectionContainer' + collection.name);
	};


	/*
		Description:
			Refreshes a collection container within the main collection.
		Inputs:
			None.
	*/
	returnObj.refresh = function() {
		shadoCollection.db.get('collectionContainer' + collection.name).refresh();
	};


	/*
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