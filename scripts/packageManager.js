/*
	Allows the user to manage "packages," and linking them
	to objects on the canvas.
*/

var packageManager = {};
packageManager.cb = {};
packageManager.dataStore;

/*
	Function that loads everything.
*/
packageManager.load = function(processNumber) {
	var dfd = new $.Deferred();

	var dataState = packageManager.getData(processNumber); //get the data.
	var pkMngState = packageManager.cb.load(); //load the colorbox.

	pkMngState.done(function() {
		dataState.done(function(data) {
			packageManager.dataStore = data; //store the data for future reference.
			var tmp = arrdb.get('cbMain');
			
			var genState = tmp.addChild(packageManager.generate(data)).refresh();
			//var genState = packageManager.generate(data).appendTo('#cbMain'); //place the data in.
			genState.state.done(function() { //make sure it has finish appending first.
				//$('#colorboxCustom').resize({width:"300px" , height:"400px"})
				dfd.resolve();
			});
			$('#colorboxCustom').tinyDraggable({ //make it draggable.
				handle:'#cboxcContent', 
				exclude: editWindow.draggableExclusions.constructString(), //Set the registered exclusions.
			});
		});
	});

	return dfd.promise();
};

packageManager.loadMain = function(parentID) {
	var dfd = new $.Deferred();
	var main = $jConstruct('div', { //the div everything is going to be appended to.
		id: 'cbMain'
	});
	//#cbCustom
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
packageManager.cb.load = function() {
	var dfd = new $.Deferred();
	var w = 300; //colorbox width
	var h = 350; //colorbox height
	$.colorboxCustom({ //open the color box.
        html: '<div id="cbCustom" style="width:100%;height:100%;"></div>',
        width: w,
        height: h,
        //opacity: '1',
        top: '5%',
        left: '65%',
        overlayClose: false
    });

    packageManager.loadMain('cbCustom').done(function(main) {
		editWindow.draggableExclusions.register('#cboxcLoadedContent'); //enables clicking on scroll bar
		editWindow.draggableExclusions.register('#cbCustom');
		editWindow.draggableExclusions.register('#cbMain');

		/*var tmp = arrdb.get('cbMain');
		for (var i = 0; i < tmp.children.length; ++i) {
			editWindow.draggableExclusions.register('#' + tmp.children[i].id);
		}*/
		
    	dfd.resolve(main); //pass the main div along!
    });

	$('#cboxcOverlay').remove(); //remove the shadow.
	$('#colorboxCustom').jScroll(); //allow it to scroll with the window.

	return dfd.promise();
};


/*
	Gets all of the data in order to show the user what packages they can utilize.
	processNumber for debugging: 479.
*/
packageManager.getData = function(processNumber) {
	var dfd = new $.Deferred();

	$db.getPackageList(processNumber).done(function(data) {
	    dfd.resolve(data); //send the data along within the resolve.
	});

	return dfd.promise();
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
			main.css({
				'background-color': 'white',
			});
		}).css({
			'font-family': 'Arial',
			'float': 'left',
			'border': '1px solid black',
			'border-radius': '3px',
			'width': '235px',
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