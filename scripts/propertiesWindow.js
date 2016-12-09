
/*
	FILE:			propertiesWindow.js
	AUTHOR:			Jesse Parnell
	DESCRIPTION:
		Manages the properties settings on any object within the FabricJS canvas. 

*/

/*
	Setup the structure of this script.
*/
var propertiesWindow = {};
	propertiesWindow.cb = {};
	propertiesWindow.shadoTool = {};
	propertiesWindow.collectionSelect = {};
	propertiesWindow.width = 250; //colorbox width
	propertiesWindow.height = 350; //colorbox height

/*
	loadMain
		This is the main div for the propertiesWindow.js portion
		of the project.
*/
propertiesWindow.loadMain = function(parentID) {
	var dfd = new $.Deferred();

	var load = function() {
		var main = arrdb.get('cbMain');
		if(!main) { //does the object already exist?
			main = $jConstruct('div', { //the div everything is going to be appended to.
				id: 'cbMain'
			});
		}

		//#cbCustom is typically the parentID value.
		main.appendTo('#'+parentID).state.done(function() { //append the main div to colorbox.
			main.css({ //set css styles to this div.
				'font-family': 'Arial',
				'border': '1px dotted black',
				'border-radius': '5px',
				'width': 'auto',
				'height': 'auto',
			});
			dfd.resolve(main); //pass the main div along!
		});
	};

	load();

	return dfd.promise();
};

/*
	load
		Load the colorbox where everything is going to be contained,
		and add a div element for jsonHTML appending.
*/
propertiesWindow.cb.load = function() {
	var dfd = new $.Deferred();
	$.colorboxCustom({ //open the color box.
        html: '<div id="cbCustom" style="width:100%;height:100%;"></div>',
        width: propertiesWindow.width,
        height: propertiesWindow.height,
        //opacity: '1',
        top: '5%',
        left: '65%',
        overlayClose: false
    });

    propertiesWindow.loadMain('cbCustom').done(function(main) {
    	dfd.resolve(main); //pass the main div along!
    });

	$('#cboxcOverlay').remove(); //remove the shadow.
	$('#colorboxCustom').jScroll(); //allow it to scroll with the window.

	return dfd.promise();
};

/*
	load the shadow management tool.
	example shadow value: 'rgba(0,0,0,0.7) 5px 5px 5px'

	todo:
		Need to add the ability to refresh this object, and force it to 
		update specifically with the current selected canvas object.
*/
propertiesWindow.shadoTool.load = function(fabricJSObj, jsonHTMLContainer) {
	var dfd = new $.Deferred();

	propertiesWindow.linkedObject = fabricJSObj; //so that the object were managing can be easily accessed. 

   	var rgb = {
   		r: undefined,
   		g: undefined,
   		b: undefined,
   		opacity: undefined,
   		horiz: undefined,
   		vert: undefined,
   		blurSize: undefined,
   	};

   	if(fabricJSObj.shadow !== undefined && fabricJSObj.shadow != null) { //if the object already has the shadow set, just use it!
   		//console.log(fabricJSObj.shadow);
   		rgb = projFuncs.rgbaDeconstruct(fabricJSObj.shadow);
   	}

   	var setSettings = function() {
   		console.log('setSettings:', rgb);
   		if(rgb.r == undefined) {
   			rgb.r = 0;
   			rgb.g = 0;
   			rgb.b = 0;
   		}
   		var shadowStr = "rgba(";
   		shadowStr += rgb.r + ',';
   		shadowStr += rgb.g + ',';
   		shadowStr += rgb.b + ',';
   		shadowStr += rgb.opacity.toString() + ') ';
   		//shadowStr += $('#shadowCreatorColorSelect')[0].value + ' ';
   		shadowStr += rgb.horiz.toString() + 'px ';
   		shadowStr += rgb.vert.toString() + 'px ';
   		shadowStr += rgb.blurSize.toString() + 'px';
   		console.log('shadow string:', shadowStr);
   		projDB.get(selected).setShadow(shadowStr);
   	};

   	var controlInput = { //default values.
	    _xOffset: "7",
	    _yOffset: "7",
	    _Color: "#d0d0d0",
	    _Opacity: ".70",
	    _Blur: "20",
	    _divowner: jsonHTMLContainer.parent.id,
	    _DivContainer: jsonHTMLContainer.id,
	    _ColorBoxontanier:"cboxcLoadedContent"
   	};

   	//console.log('controlInput:', controlInput);

   	if(rgb.r) { //if object currently has settings
   		function rgbToHex(red, green, blue) {
		    var rgb = blue | (green << 8) | (red << 16);
		    return '#' + (0x1000000 + rgb).toString(16).slice(1)
		}
		console.log('rgb:', rgb);
		controlInput._Color = rgbToHex(rgb.r, rgb.g, rgb.b);
		controlInput._xOffset = rgb.horiz.toString(); //something happneing here, turns undefined.
		controlInput._yOffset = rgb.vert.toString();
		controlInput._Opacity = rgb.opacity.toString();
		controlInput._Blur = rgb.blurSize.toString();
		//controlInput._DivContanier: "";
   	}

   	//load cmg
   	var shadowControl = new layerControls(controlInput);
   	testShadowControl = shadowControl;
   	//prop = [];
	//dt = [];

   	var setChanges = function() {
	   	console.log('shadowControl:', shadowControl); //shows that this function has access to shadowControl and it's properties.
	   	prop = []; 
	   	dt = [];
		rgb.r = shadowControl.rgb.r;
		rgb.g = shadowControl.rgb.g;
		rgb.b = shadowControl.rgb.b;
		rgb.opacity = shadowControl.opacityShadow.toString();
		rgb.blurSize = shadowControl.blurShadow.toString();
		rgb.vert = (shadowControl.yOffsetShadow || shadowControl._yOffset).toString();
		rgb.horiz = (shadowControl.xOffsetShadow || shadowControl._xOffset).toString();
		try {
			console.log('setChanges: shadowControl.rgb:', shadowControl.rgb);
		} catch (e) {
			console.log('error:', e);
		}
		setSettings();
		fabCanvas.renderAll();
   	};
	shadowControl.setOnChange(setChanges);
	shadowControl.appendTo(jsonHTMLContainer).state.done(function() {
		dfd.resolve(jsonHTMLContainer);
	})
	return dfd.promise();
};

/*
	collectionSelect Constructor
		Allows for the construction of the collection select
		dropdown.
	Inputs:
		none.
	Outputs:
		collectionSelect jsonHTML object.
*/
propertiesWindow.collectionSelect.construct = function() {
	var root = $jConstruct('div');
	root.addChild($jConstruct('div', {
		text: 'group:',
		class: 'draggableExclude',
	}).css({
		'float': 'left',
	}));

	var select = $jConstruct('select', {
		class: 'draggableExclude',
	}).event('change', function(input) {
			//var tmp = input.target.options;
			//console.log('select', arrdb.get(tmp[tmp.selectedIndex].id));
			console.log('select', input);
		}).css({
		'float': 'left',
	});

	select.addChild($jConstruct('option', { //add the default option.
		text: 'select group',
		value: 'default',
		class: 'draggableExclude',
	}));

	root.addChild(select);

	/*
		addGroup
			Adds a group option to the drop-down select.
		Inputs:
			group: The name of the fabricJS group to work with.
			sel: The function to execute after the drop-down option
				is selected.
	*/
	root.addGroup = function(group, sel) {
		var selOption = $jConstruct('option', {
			id: 'selOption' + group,
			text: group,
			value: group,
			class: 'draggableExclude',
		}).event('click', function(obj) {	
			sel(obj)
		});

		select.addChild(selOption);
	};

	/*
		Removes a group from the dropdown box.
	*/
	root.removeGroup = function(group) {
		arrdb.get('selOption' + group).remove();
	};

	/*
		Forces a select using jQuery.
	*/
	root.select = function(group) {
		$('#'+this.id).val(group);
	};

	return root; 
};


/*
	Dropdown box, that allows the user to select from a list of created
	collections, in order to assign the current active canvas object to
	a group/collection.

	todo:
		Need to add the ability to refresh this object, and force it to 
		update specifically with the current selected canvas object.
*/
propertiesWindow.collectionSelect.load = function(appendID) {
	var dfd = new $.Deferred();

	var assignedGroup = (function() {
		var obj = fabCanvas.getActiveObject();
		if(obj.hasOwnProperty('collection')) {
			return obj.collection;
		}
		return undefined;
	})();

	var selFunction = function(obj) {
		var selectedCollection = arrdb.get(obj.target.id);
		//get the collection that we are to work with.
		var collection = shadoCollection.getCollection(selectedCollection.text);
		var currCanvObj = fabCanvas.getActiveObject();
		console.log('collectionName:', currCanvObj.collection+'grid'+currCanvObj.id);
		//get the current collection tile.
		var shadoTile = arrdb.query({
			where: {
				collectionName: currCanvObj.collection+'grid'+currCanvObj.id,
			},
		});
		console.log('shadoTile:', shadoTile);
		if(shadoTile.length) { //if my object is contained within an array.
			shadoTile = shadoTile[0]; //get rid of it's array format.
		}
		collection.addExistingTile(shadoTile);		
	};

	//projFuncs.setGroups();
	var tmp0 = projFuncs.getCanvasGroups(); //groups that were created in this session.
	var tmp1 = projFuncs.getGroups(); //groups that fabricJS objects already assigned.
	var groups = [];
	var copyArray = function(arr0, arr1) {
		for(var i = 0; i < arr0.length; ++i) {
			arr1[arr1.length] = arr0[i];
		}
	};
	copyArray(tmp0, groups); //copies all objects in tmp0 to groups.
	copyArray(tmp1, groups); //copies all objects in tmp1 to groups.

	var selection = propertiesWindow.collectionSelect.construct();

	for(var i = 0; i < groups.length; ++i) {
		selection.addGroup(groups[i], selFunction);
	}

	selection.appendTo(appendID).state.done(function() {
		if(assignedGroup) {
			selection.select(assignedGroup);
		}		
		dfd.resolve();
	});

	return dfd.promise();
};

/*
	This is the text object which tells the user which package the canvas
	object is currently linked to.

	todo:
		Need to add the ability to refresh this object, and force it to 
		update specifically with the current selected canvas object.
*/
propertiesWindow.pkgSelector = function(canvObj) {
	var main = $jConstruct('div').css({
		class: 'draggableExclude',	
	});

	var getPkgName = function(obj) {
		if(obj.hasOwnProperty('packageID')) {
			return obj.package.strPackageLabel + ': ' + obj.package.strPackageDescription;
			//return ': ' + obj.packageID.toString();
		}
		return 'package not defined';
	};

	var name = $jConstruct('div', {
		text: getPkgName(canvObj),
		class: 'draggableExclude',
	}).event('mouseover', function() { //changes text to gray.
		name.css({
			'color': 'gray',
		});
	}).event('mouseout', function() { //changes text back to black.
		name.css({
			'color': 'black',
		});
	}).event('click', function() { //open package selection.
		packageManager.load(credentials.PkLstID, fabCanvas.getActiveObject());
	}).css({
		'float': 'left',
		'cursor': 'pointer',
	});

	//main.addChild(label);
	main.addChild(name);

	var pkgSelector = {};
	pkgSelector.main = main;

	pkgSelector.reloadPkgNm = function(nwCanvObj) {
		nwCanvObj = nwCanvObj ? fabCanvas.getActiveObject() : nwCanvObj; //make sure nwCanvObj has a value
		var nwName = getPkgName(nwCanvObj);
		name.text = nwName;
		name.refresh();
	};

	pkgSelector.setPkgNm = function(pkgNm) {
		name.text = pkgNm;
	};

	pkgSelector.refresh = function() {
		main.refresh();
	};

	return pkgSelector;
};

propertiesWindow.shadoToolContainer = $jConstruct('div', {
	id: 'shadoToolContainer',
});

propertiesWindow.collSelContainer = $jConstruct('div', {
	id: 'collSelContainer',
});

/*
	Handles 90% of the entire loading process. Used by refresh, and load functions.
*/
propertiesWindow.mainLoading = function(object, div) {
	propertiesWindow.shadoTool.load(object, div).done(function(appendID) {
		var collStatus = propertiesWindow.collectionSelect.load(appendID);
		var appendStatus = propertiesWindow.pkgSelector(object).main.appendTo(appendID);
		collStatus.done(function() {
			appendStatus.state.done(function() {

				projFuncs.registerExclusionsByID('#cbMain');
				$('#colorboxCustom').tinyDraggable({ //make it draggable.
					handle:'#cboxcContent', 
					exclude: projFuncs.draggableExclusions.constructString(), //Set the registered exclusions.
				});
			});
		});
	});
};

/*
	Every time the packageManager window is refreshed, it is required to clear
	all of the objects from micronDB and off the DOM.
*/

propertiesWindow.clear = function(id) {
	
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
	
	id = id ? id : 'cbMain';
	var objs = arrdb.query({
		where: {
			parent: '#' + id,
		},
	});

	clr(objs);
};


/*
	Allows the 'properties window' to refresh if a new object is clicked.
*/
propertiesWindow.refresh = function() {
	if(arrdb.get('cbMain')) {
		propertiesWindow.clear();
		//arrdb.get('cbMain').remove(); //clears the colorbox.
	}
	propertiesWindow.loadMain('cbCustom').done(function(main) {
		propertiesWindow.mainLoading(fabCanvas.getActiveObject(), main);
    });
};

/*
	Main function to load everything, and set draggable options.
*/
propertiesWindow.load = function() {
	if(arrdb.get('cbMain')) { //propertiesWindow is already open?
		propertiesWindow.refresh();
		return;
	}
	propertiesWindow.cb.load().done(function(main) {
		propertiesWindow.mainLoading(fabCanvas.getActiveObject(), main);
	});
};

/*
	NEEDS TO BE DONE:
	1. shadoTool: needs to be placed into a container.
	2. pkgSelector: needs to be placed into a container.

	- shadoTool needs a refresh function.
	- pkgSelector needs a refresh function.

	- shadoTool and pkgSelector need to refresh in their own
				ways, so that the tinyDraggable does not mess
				with pkgSelector and the ability to click on
				it.
*/