

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
			/*id: 'dragArrow',
			src: './css/images/crossArrow.png',*/
			title: 'click and drag to move window.',
		},
		create: function() {
			var imgProperties = editWindow.handle.properties;
			var cssProperties = editWindow.css.handle;
			return $jConstruct('div', imgProperties).css(cssProperties);
		},
	},
	//recursive function, populates the window with the object's ID's
	populate: function(input, appendID, propertiesBoxID) {
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
		save: {
			properties: {
				id: 'saveBtn', 
				src: './css/images/save.png',
				title: 'click to save the canvas state',
			},
			create: function(contentBox, contentPropertiesBox) {
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
		                        }
		                    } else {
		                        if(canvData.objects[i].text == typeMatch[j].text) {
		                            canvData.objects[i].name = typeMatch[j].name;
		                            canvData.objects[i].id = typeMatch[j].id;
		                        }
		                    }
		                }
		            }
		            return canvData;
		        };
				var buttonProperties = editWindow.imgButtons.save.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
	                $('#loadSpinner').show();
	        		//$db.svCanJson(PricingFormCanvasID, PhotographerID, DesignData)
	                var canvData = JSON.stringify(getCanvasData());
	        		var PricingFormCanvasID = projData.availCanv._Canvases[parseInt(canvSelected)]._indxPhotographerPackagePriceCanvasID;
	        		var PhotographerID = credentials.PhotographerID;
	                        //console.log(PricingFormCanvasID, PhotographerID, canvData);
	        		$db.svCanJson(canvSelectedID, PhotographerID, canvData).done(function(data) {
	        			console.log('Done:', data);
	                    setTimeout(function() {
	                        $('#loadSpinner').fadeOut('slow');
	                    }, 500); //fades out after wating 500 milliseconds.
	        		}).fail(function(error) {
	                    console.log(error);
	                });
				});
			},
		},
		nwObjBtn: {
			properties: {
				id: 'addNewButton',
				src: './css/images/newButton.png',
				title: 'add a new object',
			},
			create: function(contentBox, contentPropertiesBox) {
				var buttonProperties = editWindow.imgButtons.nwObjBtn.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
					$('#'+contentBox.id).empty();
					$('#'+contentPropertiesBox.id).empty();
					var addImg = $jConstruct('div', {
						text: 'Add Image',
					}).css(editWindow.css.propertyObject);

					var addTxt = $jConstruct('div', {
						text: 'Add Text',
					}).css(editWindow.css.propertyObject).event('click', function() {
		                projFuncs.addText(fabCanvas, 'New Text', {
		                    fontSize: 20,
		                    fontFamily: 'Arial',
		                    fill: 'Black',
		                }).done(function(t) {
							//forces the clicked elements to execute this function.
							projFuncs.mutableDB[t.id] = function() { 
								editWindow.imgButtons.fillObjects.start(fabCanvas.getActiveObject().type, '#'+editWindow.contentBox.instance.id, '#'+editWindow.contentPropertiesBox.instance.id);
							}
		                	fabCanvas.setActiveObject(t);
		                });
					});
					addImg.appendTo('#'+contentBox.id);
					addTxt.appendTo('#'+contentBox.id);
				});
			},
		},
		removeObject: {
			properties: {
				id: 'rmBtn',
				src: './css/images/trash.png',
				title: 'click to remove selected object',
			},
			create: function(contentBox, contentPropertiesBox) {
				var buttonProperties = editWindow.imgButtons.removeObject.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
					$('#'+contentPropertiesBox.id).empty();
					$('#'+contentBox.id).empty();
					fabCanvas.getActiveObject().remove();
					projDB.get(obj.id) = undefined;
				});
			}
		},
		listImages: { //editWindow.imgButtons.listImages.create();
			properties: {
		        id: 'imgsBtn',
		        src: './css/images/inkscape.png',
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
		        src: './css/images/word.png',
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
		layerUp: {
			properties: {
				id: 'objLayerUpBtn',
				src: './css/images/layer-up-interface-symbol-icon.jpg',
				title: 'click to cause object to move one layer up',
			},
			create: function(contentBox, contentPropertiesBox) {
				var layerUpProperties = editWindow.imgButtons.layerUp.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', layerUpProperties).css(cssProperties).event('click', function() {
					var slctdObj = fabCanvas.getActiveObject();
					if(slctdObj) {
						slctdObj.bringForward(true); //move selected object up the Z stack.
					} else {
						console.log('no object to layer');
					}
				});
			},
		},
		layerDown: {
			properties: {
				id: 'objLayerDwnBtn',
				src: './css/images/layer-down-icon.jpg',
				title: 'click to cause object to move down one layer',
			},
			create: function(contentBox, contentPropertiesBox) {
				var layerDwnProperties = editWindow.imgButtons.layerDown.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', layerDwnProperties).css(cssProperties).event('click', function() {
					var slctdObj = fabCanvas.getActiveObject();
					if(slctdObj) {
						slctdObj.sendBackwards(true);
					} else {
						console.log('no object to layer');
					}
				});
			},
		}
	},


	//fills the editWindow with data.
	fillData: function(id, appendID, propertiesBoxID) {
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
	    	var advancedFilter;
	    	if(projDB.get(id).type == 'image') {
	    		advancedFilter = ['name', 'Color', 'current', 'scale', 'fill', 'opacity', 'angle'];
	    	} else {
	    		advancedFilter = ['name', 'Color', 'current', 'text', 'stroke', 'scale', 'fill', 'font', 'opacity', 'angle'];
	    	}
	        for(var i = 0; i < advancedFilter.length; ++i) {
	            if(value.toString().indexOf(advancedFilter[i]) != -1 && value.toString() !== 'width') {
	                return false;
	            }
	        }
	        return true;
	    };

	    var colorObj = function(value, variable) {
	    	var obj = $jConstruct('div', {
	    		text: value.toString(),
	    		id: 'colorObj' + value.toString(),
	    	}).event('click', function() {
	    		if(typeof(variable[value]) == 'string' || typeof(variable[value]) == 'number') {
	    			if(obj.type == 'div') {
		    			obj.type = 'textbox',
		    			obj.text = variable[value];
		    			obj.refresh().state.done(function() {
			    			$('#'+obj.id).colorpicker({
			    				//showOn: 'focus',
			    				defaultPalette: 'web',
			    				hideButton: true,
			    				history: false,
			    			});
			    			$('#'+obj.id).on("mouseover.color", function(event, color){
			    				//console.log(color);
			    				variable[value] = color;
			    				fabCanvas.renderAll();
							});
							$('#'+obj.id).on('change.color', function(event, color) {
								console.log(color);
					    		if(obj.type == 'textbox') {
					    			obj.type = 'div';
					    			//variable[value] = $('#'+obj.id)[0].value;
					    			obj.text = value.toString();
					    			obj.refresh();
					    			//fabCanvas.renderAll();
					    		}
							});
							setTimeout(function() {
								$('#'+obj.id).colorpicker('showPalette');
							}, 50);
							
							//$('#'+obj.id).colorpicker('showPalette');
		    			});
		    			
						//$('#'+obj.id).colorpicker().showPalette();
						//$('#'+obj.id).focus();
		    			//$('#'+obj.id).trigger('click');
	    			}
	    		}
	    	}).event('keydown', function(event) {
	    		if(obj.type == 'textbox' && event) {
	    			if(event.keyCode == 13) {
	    				$('#'+obj.id).trigger('blur');
	    			}
	    		}
	    	});
	    	return obj;
	    };

	    var txtObj = function(value, variable) {
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
	    			obj.type = 'div';
	    			variable[value] = $('#'+obj.id)[0].value;
	    			obj.text = value.toString();
	    			obj.refresh();
	    			fabCanvas.renderAll();
	    		}
	    	}).event('keydown', function(event) {
	    		if(obj.type == 'textbox' && event) {
	    			if(event.keyCode == 13) {
	    				$('#'+obj.id).trigger('blur');
	    			}
	    		}
	    	});
	    	return obj;
	    };

	    /*
			creating two objects. One for changing color properties, and one for the rest of the objects properties.
	    */

	    //makes all the div's representing the user-editable properties of that canvas object.
	    var advancedOptions = [];
	    var addProperty = function(value, variable, checkFunc) {
	        if(checkFunc(value, variable)) {
	        	//console.log('addProperty, value:', value);

	        	var mkDiv;

	        	if(value.indexOf('Color') > -1 || value.indexOf('fill') > -1) {
	        		mkDiv = colorObj(value, variable);
	        	} else {
	        		mkDiv = txtObj(value, variable);
	        	}

	        	mkDiv = $jConstruct('div').css({
	        		'width': '100%',
	        	}).addChild(mkDiv);

	            if(ifAdvancedOption(value)) {
	                advancedOptions[advancedOptions.length] = mkDiv;
	            } else {
	                mkDiv.appendTo(propertiesBoxID);
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

		    var addProperties = function() {
		    	var dfd = new $.Deferred();
			    setTimeout(function() {
			    	var obj = projDB.get(selected); //gets the current object which is selected on the canvas.
			    	for(var k in obj) {
			    		addProperty(k, obj, check); //adds the other user accessible properties.
			    	}
			    	dfd.resolve();
			    }, 250);//delays the loading of the properties by 250ms.
			    return dfd.promise();
		    }
		    addProperties().done(function() {
		    	var adv = $jConstruct('div', { //advanced options that are filtered from the user.
			    	text: 'Advanced',
			    }).event('click', function() {
			    	$('#'+adv.id).remove();
			    	for(var i = 0; i < advOptions.length; ++i) {
			    		advOptions[i].appendTo(refPropDivID);
			    	}
			    });
		    	adv.appendTo(refPropDivID);
		    });
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
		//console.log('advancedOptions', advancedOptions);
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
		editWindow.imgButtons.save.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
		editWindow.imgButtons.removeObject.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
		editWindow.imgButtons.nwObjBtn.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
		editWindow.imgButtons.layerDown.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
		editWindow.imgButtons.layerUp.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
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