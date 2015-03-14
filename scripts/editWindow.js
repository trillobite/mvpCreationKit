

//contains all the functions and properties for rendering the editWindow object.
var editWindow = {
	lastObjType: undefined,
	selectedObject: undefined,
	selectedReferenceObjectID: undefined,
	css: {
		contentBox: {
			'font-family': 'sans-serif',
	        'border': '1px solid black',
	        'border-radius': '3px',
	        'width': '250',
	        'height': '87',
	        'float': 'left',
	        'overflow': 'auto',
		},
		contentPropertiesBox: {
			'font-family': 'sans-serif',
			'border': '1px solid black',
			'border-radius': '3px',
			'width': '250',
			'height': '262',
			'float': 'left',
			'overflow': 'auto',
		},
		handle: {
	        'width': '25px',
	        'height': '25px',
	        'float': 'right',
	        'cursor': 'grabbing',
		},
		imgButtons: {
	        'width': '25px',
	        'height': '25px',
	        'float': 'right',
	        'cursor': 'pointer',
		},
		propertyObject: {
			'cursor': 'pointer',
		},
	},
	openColorbox: function() {
	    $.colorboxCustom({
	        html: '<div id="cbCustom" style="width:100%;height:100%;"></div>',
	        width: '250',
	        height: '350',
	        //opacity: '0.5',
	        top: '5%',
	        left: '65%',
	        overlayClose: false
	    });
	},
	contentBox: { //define before the buttons, order of rendering declared later.
		instance: undefined,
		create: function() {
			if(!(editWindow.contentBox.instance)) { //if already created, will just return the instance.
				var cssProperties = editWindow.css.contentBox;
				editWindow.contentBox.instance = $jConstruct('div').css(cssProperties);
			}
			return editWindow.contentBox.instance;
		},
	},
	contentPropertiesBox: {
		instance: undefined,
		create: function() {
			if(!(editWindow.contentPropertiesBox.instance)) { //if already created, will just return the instance.
				var cssProperties = editWindow.css.contentPropertiesBox;
				editWindow.contentPropertiesBox.instance = $jConstruct('div').css(cssProperties);
			}
			return editWindow.contentPropertiesBox.instance;
		}
	},
	handle: {
		properties: {
			id: 'dragArrow',
			src: './css/images/crossArrow.png',
			title: 'click and drag to move window.',
		},
		create: function() {
			var imgProperties = editWindow.handle.properties;
			var cssProperties = editWindow.css.handle;
			return $jConstruct('img', imgProperties).css(cssProperties);
		},
	},
	//recursive function, populates the window with the object's ID's
	populate: function(input, appendID, propertiesBoxID) {
		console.log('appendID:', appendID);
		$(appendID).empty();
		for(var i = 0; i < input.length; ++i) {
			if(toolKit().getType(input[i]) == 'array') {
				editWindow.populate(input[i]);
			} else {
				editWindow.fillData(input[i].id, appendID, propertiesBoxID);
			}
		}
	},
	imgButtons: {
		fillObjects: {
			lastfill: undefined,
			start: function(objType, appendID, propertiesBoxID) {
				console.log('objType', objType);
				if(objType == 'image') {
					projFuncs.mutableFuncImgs = function(input) {
						if(projFuncs.mutableDB[input]) {
							projFuncs.mutableDB[input](input);
						}
					}
				} else {
					projFuncs.mutableFuncTxt = function(input) {
						if(projFuncs.mutableDB[input]) {
							projFuncs.mutableDB[input](input);
						}
					}
				}
		        if(objType) {
		            editWindow.imgButtons.fillObjects.lastfill = objType;
		        }
		        editWindow.populate(projDB.query({
		        	where: {
		        		type: editWindow.imgButtons.fillObjects.lastfill,
		        	},
		        }), appendID, propertiesBoxID);
			}
		},
		listImages: { //editWindow.imgButtons.listImages.create();
			properties: {
		        id: 'imgsBtn',
		        src: './css/images/pictures.png',
		        title: 'view image objects',
			},
			create: function(contentBox, contentPropertiesBox) {
				var buttonProperties = editWindow.imgButtons.listImages.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
					$('#'+contentPropertiesBox.id).empty(); //clears the box that shows all the properties
					editWindow.imgButtons.fillObjects.start('image', '#'+contentBox.id, '#'+contentPropertiesBox.id);
				});
			},
		},
		listTextElems: { //editWindow.imgButtons.listTextElems.create();
			properties: {
		        id: 'textObjBtn',
		        src: './css/images/photoshop.png',
		        title: 'view text objects',
			},
			create: function(contentBox, contentPropertiesBox) {
				var listTextElemsProperties = editWindow.imgButtons.listTextElems.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', listTextElemsProperties).css(cssProperties).event('click', function() {
					$('#'+contentPropertiesBox.id).empty(); //clears the box that shows all the properties.
					editWindow.imgButtons.fillObjects.start('text', '#'+contentBox.id, '#'+contentPropertiesBox.id);
				});
			},
		},
	},


	//fills the editWindow with data.
	fillData: function(id, appendID, propertiesBoxID) {
		console.log('propertiesBoxID:', propertiesBoxID);
		//console.log(id, appendID, propertiesBoxID);
		if(undefined === propertiesBoxID) {
			propertiesBoxID = '#'+editWindow.contentPropertiesBox.create().id
		}
	    var check = function(value, variable) { //check if it is an object the user should have access to.
	        var charFilter = ['_', 'get', 'set', 'has', 'to', 'is'];
	        if(typeof(variable[value]) == 'function') { //if the property is a function, don't give user access.
	            return false;
	        }
	        for(var i = 0; i < charFilter.length; ++i) { //make sure it's not another object to be filtered.
	            if(value.toString().substring(0, charFilter[i].length) == charFilter[i]) {
	                return false;
	            }
	        }
	        return true; //not an excluded property.
	    };

	    var ifAdvancedOption = function(value, variable) {
	        var advancedFilter = ['name', 'current', 'text', 'id', 'stroke', 'scale', 'fill', 'angle', 'background'];
	        for(var i = 0; i < advancedFilter.length; ++i) {
	            if(value.toString().indexOf(advancedFilter[i]) != -1 && value.toString() !== 'width') {
	                return false;
	            }
	        }
	        return true;
	    };

	    //makes all the div's representing the user-editable properties of that canvas object.
	    var advancedOptions = [];
	    var addProperty = function(value, variable, checkFunc) {
	        if(checkFunc(value, variable)) {
	            var mkDiv = function(value) {
	            	var obj = $jConstruct('div', {
	            		text: value.toString(),
	            	}).event('click', function() {
	            		if(typeof(variable[value]) == 'string' || typeof(variable[value]) == 'number') {
	            			obj.type = 'textbox',
	            			obj.text = variable[value];
	            			obj.refresh();
	            			$('#'+obj.id).select();
	            		}
	            	}).event('blur', function() {
	            		if(obj.type == 'textbox') {
	            			obj.type = 'div',
	            			variable[value] = $('#'+obj.id)[0].value; //update the data field.
	            			obj.text = value.toString();
	            			obj.refresh();
	            			fabCanvas.renderAll();
	            		}
	            	}).css(editWindow.css.propertyObject);
	            	var container = $jConstruct('div').css({
	            		'width': '100%',
	            	}).addChild(obj);

	                return container;
	            };
	            if(ifAdvancedOption(value)) {
	                advancedOptions[advancedOptions.length] = mkDiv(value);
	            } else {
	                mkDiv(value).appendTo(propertiesBoxID);
	            }
	        }
	    };

	    /*
			this function will ensure that the proper "Reference Object" within the edit window is selected.
			ID of the intended object selection is passed in. 
			referenceObjectSelect('referenceObject2225');
	    */
	    var referenceObjectSelect = function(selectedReferenceObjectID, id) {
	    	if(undefined === fabCanvas.getActiveObject() || null == fabCanvas.getActiveObject()) { //if there are no objects currently active on the canvas,
	    		fabCanvas.setActiveObject(projDB.get(id)); //set the active object to this one.
	    	} else {
	    		if(fabCanvas.getActiveObject().id != id) {
	    			fabCanvas.setActiveObject(projDB.get(id));
	    		}
	    	}

	    	if(undefined == selectedReferenceObjectID) { //if no parameter value was sent,
	    		if(editWindow.selectedReferenceObjectID) { //if a reference object has been selected in the past,
	    			selectedReferenceObjectID = editWindow.selectedReferenceObjectID //set value to the previously selected reference object.
	    		}
	    	}
	    	if(selectedReferenceObjectID) { //if there is a selected reference object:
		    	var chngBkgrnd = function(objArr) {
		    		for(var i = 0; i < objArr.length; ++i) {
		    			if(toolKit().getType(objArr[i]) == 'array') { //recursive if there are arrays in arrays.
		    				chngBkgrnd(objArr[i]); //the recursive call.
		    			} else {
		    				objArr[i].css({
		    					'background-color': 'white', //set all other objects to the default background color: white.
		    				});
		    			}
		    		}
		    		var obj = arrdb.get(selectedReferenceObjectID); //get the referenced object.
		    		if(obj) { //be sure the object even exists.
		    			obj.css({
		    				'background-color': '#ADADAD',
		    			});
		    		}
		    	};

		    	chngBkgrnd(arrdb.query({ //make the one which is to be selected, appear selected within the application.
		    		where: {
		    			name: 'projectObject',
		    		},
		    	}));
	    	} else {
	    		return false; //failed to have an ID to work with
	    	}
	    	return true; //everything was processed to completion.
	    };
	    var renderRefProp = function(refPropDivID, advOptions) {
		    $(refPropDivID).empty(); //already has the '#.'
		    setTimeout(function() {
		    	var adv = $jConstruct('div', { //advanced options that are filtered from the user.
		    		text: 'Advanced',
		    	}).event('click', function() {
		    		$('#'+advanced.id).remove();
		    		for(var i = 0; i < advOptions.length; ++i) {
		    			advOptions[i].appendTo(refPropDivID);
		    		}
		    	});
		    	var obj = projDB.get(selected); //gets the current object which is selected on the canvas.
		    	for(var k in obj) {
		    		addProperty(k, obj, check); //adds the other user accessible properties.
		    	}
		    }, 250);//delays the loading of the properties by 250ms.
	    };
	    var renderSelection = function(fbJsObjID, refDivID, refPropDivID, advOptions) {
	    	if(fabCanvas.getActiveObject()) {
	    		//edit window does not need to be rendered again, if it was already rendered properly.
		    	if(fabCanvas.getActiveObject().type != editWindow.lastObjType) {
		    		editWindow.lastObjType = fabCanvas.getActiveObject().type;
		    		editWindow.populate(fabCanvas.getActiveObject(), editWindow.contentBox.instance.id, editWindow.contentPropertiesBox.instance.id);
		    	}
	    	}
	    	renderRefProp(refPropDivID, advOptions);
	    	referenceObjectSelect(refDivID, fbJsObjID);
	    };
	    var fillRefObjDiv = function(fbJsObjID, refDivID, refPropDivID, advOptions) {
	    	var refObjDiv = $jConstruct('div', {
	    		id: refDivID,
	    		name: 'projectObject',
	    		text: (function() {
	    			if(projDB.get(fbJsObjID).name == 'name not defined') {
	    				return fbJsObjID;
	    			} else {
	    				return projDB.get(fbJsObjID).name;
	    			}
	    		})(),
	    	}).event('click', function() {
	    		fabCanvas.setActiveObject(projDB.get(fbJsObjID)); //will trigger the 'selected' listener on the object, which activates the function.
	    	}).css(editWindow.css.propertyObject);
	    	var activeObject = fabCanvas.getActiveObject();
	    	if(activeObject) {
		    	if(id == activeObject.id) { //if there is an object already selected on the canvas.
		    		refObjDiv.css({
		    			'background-color': '#ADADAD',
		    		}).addFunction(function() {
		    			renderSelection(id, refDivID, propertiesBoxID, advOptions);
		    		});
		    	}
	    	}
	    	return refObjDiv;
	    };

	    var refObjDivID = 'refObjDiv'+Math.random().toString(36).substring(2);
		
		//forces the clicked elements to execute this function.
		projFuncs.mutableDB[id] = function() { 
			editWindow.imgButtons.fillObjects.start(fabCanvas.getActiveObject().type, '#'+editWindow.contentBox.instance.id, '#'+editWindow.contentPropertiesBox.instance.id);
		}
		console.log('advancedOptions', advancedOptions);
	    var refObjDiv = fillRefObjDiv(id, refObjDivID, propertiesBoxID, advancedOptions);
	    refObjDiv.appendTo('#'+editWindow.contentBox.instance.id); //append the reference object div to the contentBox.
	},

	load: function() {
		//open the colorbox so the rest of the loading can begin.
		editWindow.openColorbox();
		var contentBox = editWindow.contentBox.create();
		var contentPropertiesBox = editWindow.contentPropertiesBox.create();

		//allows for the correct order of rendering.
		editWindow.handle.create().appendTo('#cbCustom');
		editWindow.imgButtons.listImages.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
		editWindow.imgButtons.listTextElems.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');

		//append contentBox now after the buttons.
		contentBox.appendTo('#cbCustom');
		contentPropertiesBox.appendTo('#cbCustom');

		var w = parseInt($('#'+contentBox.id).width()) + 70;
		var h = parseInt(editWindow.css.contentBox['height']) + parseInt(editWindow.css.contentPropertiesBox['height']) + 100;

		//Allows the colorbox to be moved. Exclude the content box and properties box as a draggable source.
		$('#colorboxCustom').tinyDraggable({handle:'#cboxcContent', exclude:'input, textarea, #'+contentBox.id+', #'+contentPropertiesBox.id});
		$('#cboxcOverlay').remove();
		$('#colorboxCustom').jScroll();
		//$('#cboxcContent').css({'opacity': '0.7'});
		$.colorboxCustom.resize({width: w.toString(), height: h.toString()});
	},
};

/*
prevent cache random characters:

"hT4yTTypdb9u"
"pq885CZlCOsh"
"PDCVUOzldY5b"
*/