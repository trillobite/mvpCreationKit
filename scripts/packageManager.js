/*
	Allows the user to manage "packages," and linking them
	to objects on the canvas.
*/

var packageManager = {};
packageManager.cb = {};
packageManager.dataStore;
packageManager.width = 250; //colorbox width
packageManager.height = 350; //colorbox height
packageManager.processNumber;
packageManager.assignedIDs;
packageManager.canvObj;
packageManager.db = new micronDB();

/*
	Will hash all of the data that is given from the database. 
	dtaInput: data pulled in from the "getData" function. 
*/
packageManager.dataHash = function(dtaInput) {
	var dfd = $.Deferred();
	var hashIt = function(obj) {
		for(var i = 0; i < obj.length; ++i) {
			packageManager.db.hash(obj[i]);
		}
		dfd.resolve();
	}
	hashIt(dtaInput.Packages);
	return dfd.promise;
};

/*
	Every time the packageManager window is refreshed, it is required to clear
	all of the objects from micronDB and off the DOM.
*/
packageManager.clear = function(id) {
	id = id ? id : 'pbMain';
	var obj = arrdb.get(id);
	//console.log('clear:', obj.children)
	if(!obj.children) {
		return; //already cleared!
	}
	for(var i = 0; i < obj.children.length; ++i) {
		if(obj.children[i].children.length) {
			packageManager.clear(obj.children[i].id);
		}
		arrdb.remove(obj.children[i].id);
		obj.children[i].remove();
	}

};



packageManager.clearTest = function() {
	var result = projDB.query({
		where: {
			packageID: function(input) {
				return input ? true : false;
			},
		},
	});

	return arrdb.query({
		where: {
			indxPackageID: result[0].packageID,
		},
	});
};

/*
	input = {
		canvObj: object,
		processNumber: int,
	}
*/
packageManager.refresh = function(input) {
	
	var dfd = $.Deferred();

	//make sure all of the relevant data is loaded, the best it can be. 
	if(input) {
		packageManager.canvObj = input.canvObj ? input.canvObj : packageManager.canvObj;
		packageManager.processNumber = input.processNumber ? input.processNumber : packageManager.processNumber;
	} else {
		packageManager.canvObj = fabCanvas.getActiveObject();
		if(!packageManager.processNumber) {
			packageManager.processNumber = credentials.PkLstID;
		}
	}

	packageManager.clear();
	var exec = function(data) {
		var tmp = arrdb.get('pbMain');
		tmp.children = [];
		//var genState = tmp.refresh();
		var genState = tmp.addChild(packageManager.generate(data)).refresh();
		//var genState = packageManager.generate(data).appendTo('#pbMain'); //place the data in.
		genState.state.done(function() { //make sure it has finish appending first.
			//$('#colorboxCustom').resize({width:"300px" , height:"400px"})
			packageManager.setAssignedTiles();
			dfd.resolve();
		});
	};

	if(arrdb.get('pbMain')) {
		var dataState = packageManager.getData(packageManager.processNumber); //get the data.
		dataState.done(function(data) {
			exec(data);
		});
	}

	return dfd.promise();
};

/*
	Function that loads everything.
*/
packageManager.load = function(processNumber, canvObj) {
	var dfd = new $.Deferred();

	var exec = function() {
		//if canvas object is specified, link it!
		packageManager.canvObj = canvObj ? canvObj : packageManager.canvObj;

		var dataState = packageManager.getData(processNumber); //get the data.
		var pkMngState = packageManager.cb.load(); //load the colorbox.

		pkMngState.done(function() {
			dataState.done(function(data) {
			
				
				var tmp = arrdb.get('pbMain');
			
				var genState = tmp.addChild(packageManager.generate(data)).refresh();
				//var genState = packageManager.generate(data).appendTo('#pbMain'); //place the data in.
				genState.state.done(function() { //make sure it has finish appending first.
					//$('#colorboxCustom').resize({width:"300px" , height:"400px"})
					packageManager.setAssignedTiles();
					dfd.resolve();
				});
				$('#packageBox').tinyDraggable({ //make it draggable.
					handle:'#pboxcContent', 
					exclude: editWindow.draggableExclusions.constructString(), //Set the registered exclusions.
				});
			});
		});
	};

//check here for the reason why my data is duplicating...

	if(arrdb.get('pbMain')) {
		packageManager.refresh({
			canvObj: canvObj,
			processNumber: processNumber,
		}).done(function() {
			dfd.resolve();	
		});
	} else {
		exec();
	}

	return dfd.promise();
};

/*
	Finds all of the objects currently on the canvas which are linked to a package 
	definition.
*/
packageManager.getAssignedCanvObjs = function() {
	var result = projDB.query({
		where: {
			packageID: function(input) {
				return input ? true : false;
			},
		},
	});
	
	return result;
};

/*
	Finds all of the objects from the canvas which are assigned to a package, 
	and returns their id's within an array.
*/
packageManager.getAssignedIDs = function(refresh) {
	if(packageManager.assignedIDs) { //always execute the rest of the code, if no ID's have been assigned.'
		if(!refresh) { //determines whether the user wishes to use cached objects or not.
			return packageManager.assignedIDs;
		}
	}

	var ids = [];
	var filter = function(canvObj) {
		if(canvObj.length) { //check if object is actually an array.
			for(var i = 0; i < canvObj.length; ++i) {
				filter(canvObj[i]);
			}
		}
		if(canvObj.id) {
			ids[ids.length] = canvObj.id; //if not an array, just store the id.
		}
	};
	filter(packageManager.getAssignedCanvObjs());
	packageManager.assignedIDs = ids;
	return ids;
};

/*
	Takes an array of canvas objects that are linked to a package definition, 
	and sets their background to another color, in order to show the user that
	these objects are actually assigned to something already.
*/
packageManager.setAssignedTiles = function(canvObjs) {
	if(!canvObjs) {
		canvObjs = packageManager.getAssignedCanvObjs();
	}
	for(var i = 0; i < canvObjs.length; ++i) {
		//should return an array with only one object.
		var tiles = arrdb.query({
			where: {
				indxPackageID: canvObjs[0].packageID,
			},
		});
		//loop through them all, just in case more than one object is returned in the query.
		for(var j = 0; j < tiles.length; ++j) {
			tiles[j].css({
				'background-color': 'blue', //change background to show a canvas object has been assinged to this.
			});
		}
	}
};

packageManager.loadMain = function(parentID) {
	var dfd = new $.Deferred();
	var main = $jConstruct('div', { //the div everything is going to be appended to.
		id: 'pbMain'
	});
	//#pbCustom
	main.appendTo('#'+parentID).state.done(function() { //append the main div to colorbox.
		main.css({ //set css styles to this div.
			'font-family': 'Arial',
			'border': '1px dotted black',
			'border-radius': '5px',
			'width': '235px',
			//'height': 'auto',
		});
		dfd.resolve(main); //pass the main div along!
	});
	return dfd.promise();
};


/*
	Open up the colorbox, so objects can be inserted.
*/
packageManager.cb.load = function(def) {
	var dfd = new $.Deferred();
	var param = {
        html: '<div id="pbCustom" style="width:100%;height:100%;"></div>',
        width: packageManager.width,
        height: packageManager.height,
        //opacity: '1',
        top: '5%',
        left: '65%',
        overlayClose: false
	};
	
	$.packageBox(param);

    packageManager.loadMain('pbCustom').done(function(main) {
		editWindow.draggableExclusions.register('#pboxcLoadedContent'); //enables clicking on scroll bar
		editWindow.draggableExclusions.register('#pbCustom');
		editWindow.draggableExclusions.register('#pbMain');

    	dfd.resolve(main); //pass the main div along!
    });

	$('#pboxcOverlay').remove(); //remove the shadow.
	$('#packageBox').jScroll(); //allow it to scroll with the window.

	return dfd.promise();
};


/*
	Gets all of the data in order to show the user what packages they can utilize.
	processNumber for debugging: 479.
*/
packageManager.getData = function(processNumber) {
	var dfd = new $.Deferred();

	$db.getPackageList(processNumber).done(function(data) {
		packageManager.db.db = []; //so we don't get duplicate objects.
		packageManager.dataStore = []; //so we don't get duplicate objects.

		packageManager.dataHash(data); //hash it into micronDB!
	    packageManager.dataStore = data; //store the data for future reference.

		dfd.resolve(data); //send the data along within the resolve.
	});

	return dfd.promise();
};

/*
	Checks if object is assigned to a package.
*/
packageManager.isAssigned = function(id, refresh) {
	var ids = packageManager.getAssignedIDs(refresh);
	for(var i = 0; i < ids.length; ++i) {
		if(ids[i] == id) {
			return true;
		}
	}
	return false;
};

/*
	Generates all of the div elements that can be appended into the window.
*/
packageManager.generate = function(obj) {
	var packages = $jConstruct('div');
	//editWindow.draggableExclusions.register('#'+packages.id);

	var mkObj = function(pk) {
		var main = $jConstruct('div', {
			indxPackageID: pk.indxPackageID,
		}).event('mouseover', function() {
			main.css({
				'background-color': 'gray',
			});
		}).event('mouseout', function() {
			if(!packageManager.assignedIDs) {
				packageManager.getAssignedIDs();
			}
			main.css({
				'background-color': 'white',
			});
		}).event('click', function() {
			if(packageManager.canvObj) {
				packageManager.canvObj.packageID = pk.indxPackageID;
				packageManager.canvObj.package = pk;
				propertiesWindow.load(); //causes the properties Window to refresh.
			}
		}).css({
			'font-family': 'Arial',
			'float': 'left',
			'border': '1px solid black',
			'border-radius': '3px',
			'width': '190px',
			'cursor': 'pointer',
		});

		var label = $jConstruct('div', {
			text: pk.strPackageLabel + ': ',
		}).css({
			'float': 'left',
		});

		var description = $jConstruct('div', {
			text: pk.strPackageDescription,
		}).css({
			'float': 'left',
			'color': 'gray',
			'margin-left': '5px',
		});

		main.addChild(label);
		main.addChild(description);

		return main;
	}

	for(var i = 0; i < obj.Packages.length; ++i) {
		packages.addChild(mkObj(obj.Packages[i]));
	}

	return packages;
};