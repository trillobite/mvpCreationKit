
//contains all the functions and properties for rendering the editWindow object.
var editWindow = {
	lastObjType: undefined,
	selectedObject: undefined,
	selectedReferenceObjectID: undefined,
	draggableExclusions: { //register id's of objects to exclude from draggable function.
		id: [],
		register: function(input) {
			if(this.id.indexOf(input) == -1) { //check and ensure no duplicates.
				this.id[this.id.length] = input;
			}
		},
		remove: function(input) {
			delete this.id[input];
		},
		constructString: function() {
			var constructed = "";
			for(var i = 0; i < this.id.length; ++i) {
				if(i) { //when i is not 0. 
					constructed += ', ' + this.id[i];
				} else {
					constructed += this.id[i];
				}
			}
			console.log(constructed);
			return constructed;
		},
	},
	css: {
		contentBox: {
			'font-family': 'sans-serif',
	        'border': '1px dotted black',
	        'border-radius': '3px',
	        'width': '250',
	        'height': '87',
	        'float': 'left',
	        'overflow': 'auto',
		},
		contentPropertiesBox: {
			'font-family': 'sans-serif',
			'border': '1px dotted black',
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
		propertyClassObject: {
			'cursor': 'pointer',
			'font-weight': '600',
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
			if(toolKit().getType(input[i]) == 'array') { //micronDB will return either a single object, or an array.
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
					projFuncs.mutableFuncImgs = function(input) { //Changes the function within script.js
						if(projFuncs.mutableDB[input]) {
							projFuncs.mutableDB[input](input);
						}
					}
				} else {
					projFuncs.mutableFuncTxt = function(input) { //Changes the function within script.js
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
		settings: {
			properties: {
				id: 'settingsBtn',
				src: './css/images/settingsGear.png',
				title: 'click to change canvas settings',
			},
			create: function(contentBox, contentPropertiesBox) {
				var buttonProperties = editWindow.imgButtons.settings.properties;
				var cssProperties = editWindow.css.imgButtons;

				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
					$('#'+contentPropertiesBox.id).empty(); //make sure nothing is inside.
					$('#'+contentBox.id).empty();

				    /*
						Creates a spinner and div object to be used for the canvas manipulations.
						INPUT structure:
							{
								id: spinnerID,
								property: propertyName, //property currently manipulating
							}
				    */
					var canvSpinner = function(input) {
						var spinner = $jConstruct('spinner', {
							value: fabCanvas[input.property.toLowerCase()].toString(),
						}).event('keydown', function(event) {
							if(event.keyCode == 13) {
								fabCanvas['set'+input.property](parseInt($('#' + spinner.id)[0].value)); //get the value of the spinner, and return it as an int.
								fabCanvas.renderAll();
								spinner.css({
									'display': 'none',
								});
								spinnerDiv.css({
									'display': 'block',
								});
								fabCanvas.renderAll(); //fabricJS rendering bug fix.
							}
						});
						var spinnerDiv = $jConstruct('div', {
							id: input.id, //if undefined, jsonHTML assigns one automatically.
							text: 'Canvas ' + input.property, //Will output 'Canvas Height' or 'Canvas Width' as an example.
							class: 'selectable',
						}).event('click', function() {
							spinnerDiv.css({
								'display': 'none',
							});
							if(!spinner.parent) {
								spinner.appendTo(spinnerDiv.parent);
							}
							spinner.css({
								'display': 'block',
							});
						});
						editWindow.draggableExclusions.register(spinnerDiv.id);
						return spinnerDiv;
					}

					var canvHeight = (function() {
						return canvSpinner({
							id: 'canvHeight',
							property: 'Height', //property currently manipulating
						});
					})();

					var canvWidth = (function() {
						return canvSpinner({
							id: 'canvWidth',
							property: 'Width', //property currently manipulating
						});
					})();

					var canvBkgrndColor = $jConstruct('div', {
						text: 'Canvas Background Color',
						class: 'selectable',
					}).event('click', function() {
						canvBkgrndColor.type = 'textbox';
						canvBkgrndColor.refresh().state.done(function() {
				    		$('#'+canvBkgrndColor.id).colorpicker({
				    			defaultPalette: 'web',
				    			hideButton: true,
				    			history: false,
				    		});
							$('#'+canvBkgrndColor.id).on('change.color', function(event, color) {
								console.log(color);
								function hexToRgb(hex) {
								    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
								    return result ? {
								        r: parseInt(result[1], 16),
								        g: parseInt(result[2], 16),
								        b: parseInt(result[3], 16)
								    } : null;
								}
								var tmp = hexToRgb(color);
								fabCanvas.setBackgroundColor('rgb('+tmp.r+','+tmp.g+','+tmp.b+')'); //changes the background color of the canvas.
						    	if(canvBkgrndColor.type == 'textbox') {
						    		canvBkgrndColor.type = 'div';
						    		canvBkgrndColor.refresh();
						    		fabCanvas.renderAll();
						    	}
							});
							setTimeout(function() {
								$('#'+canvBkgrndColor.id).colorpicker('showPalette');
							}, 50);
						});
					});


					var canvasSettings = $jConstruct('div', {
						text: 'Canvas settings',
						class: 'selectable',
					}).event('click', function() {
						$('#'+contentPropertiesBox.id).empty(); //make sure nothing is inside.
						canvHeight.appendTo(contentPropertiesBox);
						canvWidth.appendTo(contentPropertiesBox);
						canvBkgrndColor.appendTo(contentPropertiesBox);
					});

					var editWindowSettings = $jConstruct('div', {
						text: 'Edit window settings',
						class: 'selectable',
					}).event('click', function() {
						$('#'+contentPropertiesBox.id).empty(); //make sure nothing is inside.
						$jConstruct('div', {
							text: 'these settings are coming soon!',
						}).appendTo(contentPropertiesBox);
					});

					canvasSettings.appendTo(contentBox);
					editWindowSettings.appendTo(contentBox);


				});
			},
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
				var buttonProperties = editWindow.imgButtons.save.properties;
				var cssProperties = editWindow.css.imgButtons;
				return $jConstruct('img', buttonProperties).css(cssProperties).event('click', function() {
	                $('#loadSpinner').show();
	                var canvData = JSON.stringify(getCanvasData());
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
						text: 'Add image instructions',
						class: 'selectable',
					}).css(editWindow.css.propertyObject).event('click', function() {
						$jConstruct('div', {
							text: 'Open the folder within your computer which contains your image, and insert it by clicking and dragging it into the canvas.'
						}).appendTo('#'+editWindow.contentPropertiesBox.instance.id);
					});

					var addTxt = $jConstruct('div', {
						text: 'Add text',
						class: 'selectable',
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
					projDB.remove(fabCanvas.getActiveObject().id);
					fabCanvas.getActiveObject().remove();
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

	    /*
			One for changing color properties, and one for the rest of the objects properties.
	    */

	    var colorObj = function(value, variable) {
	    	var obj = $jConstruct('div', {
	    		text: value.toString(),
	    		id: 'colorObj' + value.toString(),
	    		class: 'selectable',
	    	}).css(editWindow.css.propertyObject).event('click', function() {
	    		if(typeof(variable[value]) == 'string' || typeof(variable[value]) == 'number') {
	    			if(obj.type == 'div') {
		    			obj.type = 'textbox',
		    			obj.text = variable[value];
		    			obj.refresh().state.done(function() {
			    			$('#'+obj.id).colorpicker({
			    				defaultPalette: 'web',
			    				hideButton: true,
			    				history: false,
			    			});
			    			$('#'+obj.id).on("mouseover.color", function(event, color){
			    				variable[value] = color;
			    				fabCanvas.renderAll();
							});
							$('#'+obj.id).on('change.color', function(event, color) {
								console.log(color);
					    		if(obj.type == 'textbox') {
					    			obj.type = 'div';
					    			obj.text = value.toString();
					    			obj.refresh();
					    		}
							});
							setTimeout(function() {
								$('#'+obj.id).colorpicker('showPalette');
							}, 50);
		    			});
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
	    		class: 'selectable',
	    	}).css(editWindow.css.propertyObject).event('click', function() {
	    		if(typeof(variable[value]) == 'string' || typeof(variable[value]) == 'number') {
	    			obj.type = 'textbox',
	    			obj.text = variable[value];
	    			obj.refresh();
	    			$('#'+obj.id).select();
	    		}
	    	}).event('blur', function() {
	    		if(obj.type == 'textbox') {
	    			obj.type = 'div';
	    			console.log($('#'+obj.id)[0].value.toString());
	    			//variable.setText($('#'+obj.id)[0].value.toString());
	    			variable[value] = $('#'+obj.id)[0].value;
	    			variable.setText(variable.getText());
	    			obj.text = value.toString();
	    			obj.refresh().state.done(function() {
	    				fabCanvas.renderAll();
	    				fabCanvas.renderAll();
	    			});
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

	    //creates the drop-down font picker element.
	    var fontPickerObj = function(value, variable) {
	    	//the picker will turn visible upon a click event in divPicker.
	    	var picker = new newPicker().render();
	    	picker.event('keydown', function(event) {
	    		if(event.keyCode == 13) {
	    			projDB.get(selected).fontFamily = $('#'+picker.id)[0].value;
	    			fabCanvas.renderAll();
	    			picker.css({
	    				'display': 'none', //when the user is done with it, it hides.
	    			});
	    			divPicker.css({
	    				'display': 'block',
	    			});
	    			fabCanvas.renderAll(); //fabricJS bug: must render these changes twice.
	    		}
	    	});
	    	//makes the div element that will hide for the picker upon a click event.
	    	var divPicker = $jConstruct('div', {
	    		text: value.toString(),
	    		class: 'selectable',
	    	}).css(editWindow.css.propertyObject).addFunction(function() { //inject the hidden picker object like a virus MUHAHAHAH!
	    		picker.css({
	    			'display': 'none',
	    		});
	    		picker.appendTo(divPicker.parent);
	    	}).event('click', function() {
	    		divPicker.css({
	    			'display': 'none',
	    		});
	    		picker.css({
	    			'display': 'block',
	    		});
	    		if(projDB.get(selected).fontFamily) {
	    			$('#'+picker.id)[0].value = projDB.get(selected).fontFamily; //pre-select the font which is set to the clicked object.
	    		}
	    		console.log(picker.id);
	    	});
	    	return divPicker;
	    };

	    /*
			Creates a spinner and div object to be used for the canvas object manipulations.
			INPUT structure:
				{
					value: undefined,
					variable: undefined,
					id: spinnerID,
					property: propertyName, //property currently manipulating
				}
	    */
	    var makeSpinner = function(input) {
	    	var submit = function() {
	    		projDB.get(selected)[input.property] = $('#' + spinner.id)[0].value;
	    		fabCanvas.renderAll();
	    		spinner.css({
	    			'display': 'none',
	    		});
	    		spinnerDiv.css({
	    			'display': 'block',
	    		});
	    		fabCanvas.renderAll(); //fabricJS bug: must render these changes twice.
	    	};
	    	var spinner = $jConstruct('spinner', {
	    		id: input.id,
	    		value: input.variable[input.property],
	    	}).event('keydown', function(event) {
	    		if(event.keyCode == 13) {
	    			submit();
	    		}
	    	});
	    	var spinnerDiv = $jConstruct('div', {
	    		text: input.value.toString(),
	    		class: 'selectable',
	    	}).css(editWindow.css.propertyObject).event('click', function() {
	    		spinnerDiv.css({
	    			'display': 'none',
	    		});
	    		if(!spinner.parent) {
	    			spinner.appendTo(spinnerDiv.parent);
	    		}
	    		$('#' + spinner.id)[0].value = projDB.get(selected)[input.property];
	    		spinner.css({
	    			'display': 'block',
	    		});
	    		$('#' + spinner.id).focus();
	    	});
	    	return spinnerDiv;
	    };

	    /*
			Creates a select and div object to be used for the canvas object manipulations.
			INPUT structure:
				{
					value: undefined,
					variable: undefined,
					id: spinnerID,
					property: propertyName, //Property currently manipulating.
					options: [undefined, undefined, undefined], //Values to be in the selection.
				}
	    */
		var makeSelect = function(input) {
			var sel = $jConstruct('select', {
				id: input.id,
			}).event('keydown', function(event) {
				if(event.keyCode == 13) {
					projDB.get(selected)[input.property] = $('#' + sel.id)[0].value;
					fabCanvas.renderAll();
					sel.css({
						'display': 'none',
					});
					divSel.css({
						'display': 'block',
					});
					fabCanvas.renderAll(); //fabricJS rendering bug fix.
				}
			});
			for(var i = 0; i < input.options.length; ++i) {
				sel.addChild($jConstruct('option', {
					text: input.options[i],
					value: input.options[i],
				}));
			}
			var divSel = $jConstruct('div', {
				text: input.value.toString(),
				class: 'selectable',
			}).css(editWindow.css.propertyObject).event('click', function() {
				divSel.css({
					'display': 'none',
				});
				if(!sel.parent) {
					sel.appendTo(divSel.parent);
				}
				$('#' + sel.id)[0].value = input.variable[input.property];
				sel.css({
					'display': 'block',
				});
			});
			return divSel;
		};

	    /*
			Manipulates the font size of a fabricJS text element.
			Simply inputs as a parameter an object to create the spinner object,
			and returns it to the calling function.
	    */
	    var fontSizeSpinner = function(value, variable) {
	    	//editWindow.draggableExclusions.register('#fontSizeSpinner'); //ensures that it will be excluded from the draggable function.
	    	return makeSpinner({
	    		value: value,
	    		variable: variable,
	    		id: 'fontSizeSpinner',
	    		property: 'fontSize',
	    	});
	    };

	    /*
			Manipulates the width of a fabricJS image element.
			Simply inputs as a parameter an object to create the spinner object,
			and returns it to the calling function.
	    */
		var widthSpinner = function(value, variable) {
			//editWindow.draggableExclusions.register('#widthSpinner'); //ensures that it will be excluded from the draggable function.
			return makeSpinner({
	    		value: value,
	    		variable: variable,
	    		id: 'widthSpinner',
	    		property: 'width',
	    	});
		};

	    /*
			Manipulates the height of a fabricJS image element.
			Simply inputs as a parameter an object to create the spinner object,
			and returns it to the calling function.
	    */
		var heightSpinner = function(value, variable) {
			//editWindow.draggableExclusions.register('#heightSpinner'); //ensures that it will be excluded from the draggable function.
			return makeSpinner({
				value: value,
				variable: variable,
				id: 'heightSpinner',
				property: 'height',
			});
		};

	    /*
			Manipulates the font weight of a fabricJS text element.
			Simply inputs as a parameter an object to create the select object,
			and returns it to the calling function.
	    */
	    var fontWeightSelect = function(value, variable) {
	    	//editWindow.draggableExclusions.register('#fontWeightSelect'); //ensures that it will be excluded from the draggable function.
	    	return makeSelect({
					value: value,
					variable: variable,
					id: 'fontWeightSelect',
					property: 'fontWeight', //Property currently manipulating.
					options: ['bold', 'normal', '400', '600', '800'], //Values to be in the selection.
			});
	    };

	    /*
			Manipulates the font style of a fabricJS text element.
			Simply inputs as a parameter an object to create the select object,
			and returns it to the calling function.
	    */
	    var fontStyleSelect = function(value, variable) {
	    	//editWindow.draggableExclusions.register('#fontStyleSelect'); //ensures that it will be excluded from the draggable function.
	    	return makeSelect({
					value: value,
					variable: variable,
					id: 'fontStyleSelect',
					property: 'fontStyle', //Property currently manipulating.
					options: ['normal', 'italic'], //Values to be in the selection.
			});
	    };

	    /*
			Manipulates the font decoration of a fabricJS text element.
			Simply inputs as a parameter an object to create the select object,
			and returns it to the calling function.
	    */
	    var textDecorationSelect = function(value, variable) {
	    	//editWindow.draggableExclusions.register('#textDecorationSelect'); //ensures that it will be excluded from the draggable function.
	    	return makeSelect({
					value: value,
					variable: variable,
					id: 'textDecorationSelect',
					property: 'textDecoration', //Property currently manipulating.
					options: ['default', 'underline', 'line-through', 'overline'], //Values to be in the selection.
			});
	    };

	    /*
			Manipulates the text align of a fabricJS text element.
			Simply inputs as a parameter an object to create the select object,
			and returns it to the calling function.
	    */
	    var textAlignSelect = function(value, variable) {
	    	//editWindow.draggableExclusions.register('#textAlignSelect'); //ensures that it will be excluded from the draggable function.
	    	return makeSelect({
					value: value,
					variable: variable,
					id: 'textAlignSelect',
					property: 'textAlign', //Property currently manipulating.
					options: ['left', 'center', 'right'], //Values to be in the selection.
			});
	    };


	    /*
			These are filters which control what options are initially displayed on the screen.
			Other than the advanced filter, all objects matching the filters definitions are stored
			within the filters db array (objs).
			The advanced filter is setup to catch all that do not match the other filters.
	    */

	    //Constructs a parent div that will ensure the sizing of everything is correct,
	    //then inserts the jsonHTML object into the parent.
	    var tmpConstruct = function(input) {
	    	return $jConstruct('div').css({
	    		'width': '100%',
	    	}).addChild(input);
	    };


	    var rgbaDeconstruct = function(rgba) {
	    	var tmp = {
	    		r: undefined,
	    		g: undefined,
	    		b: undefined,
	    		opacity: undefined,
	    		horiz: undefined,
	    		vert: undefined,
	    		blurSize: undefined,
	    	};
	    	//console.log('rgbaDeconstruct:', rgba);
	    	var colors = rgba.color.substring(rgba.color.indexOf('(') + 1, rgba.color.indexOf(')'));
	    	tmp.r = colors.substring(0, colors.indexOf(','));
	    	colors = colors.substring(colors.indexOf(',') + 1, colors.length);
	    	tmp.g = colors.substring(0, colors.indexOf(','));
	    	colors = colors.substring(colors.indexOf(',')+1, colors.length);
	    	tmp.b = colors.substring(0, colors.indexOf(','));
	    	colors = colors.substring(colors.indexOf(',')+1, colors.length);
	    	tmp.opacity = colors;
	    	tmp.horiz = rgba.offsetY;
	    	tmp.vert = rgba.offsetX;
	    	tmp.blurSize = rgba.blur;
	    	return tmp;
	    }

	    //example shadow: 'rgba(0,0,0,0.7) 5px 5px 5px'
	    var shadowCreator = function(value, variable) { //variable is the object which we are modifying.
	    	
	    	var rgb = {
	    		r: undefined,
	    		g: undefined,
	    		b: undefined,
	    		opacity: undefined,
	    		horiz: undefined,
	    		vert: undefined,
	    		blurSize: undefined,
	    	};

	    	if(variable.shadow !== undefined && variable.shadow != null) { //if the object already has the shadow set, just use it!
	    		//console.log(variable.shadow);
	    		rgb = rgbaDeconstruct(variable.shadow);
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

			//divs for the shadowControl.
			var shadowCreatorExpanded = $jConstruct('div').addChild($jConstruct('div', {
				id: 'shadowControl',
			})).addChild($jConstruct('div', {
				id: 'OpacityControl'
			}));

	    	var shadowCreatorDiv = $jConstruct('div', {
	    		text: value.toString(), //toString is optional, simply prevents an error.
	    		class: 'selectable',
	    	}).event('click', function() {
	    		shadowCreatorDiv.css({
	    			'display': 'none',
	    		});
	    		if(!shadowCreatorExpanded.parent) { 
	    			shadowCreatorExpanded.appendTo(shadowCreatorDiv.parent); //create the divs for shadowControl.
	    		}

	    		console.log('shadowCreatorDiv:', rgb);

	    		var controlInput = { //default values.
			        _xOffset: "7",
			        _yOffset: "7",
			        _Color: "#d0d0d0",
			        _Opacity: ".70",
			        _Blur: "20",
			        _divowner: "shadowControl",
			        _DivContainer: editWindow.contentPropertiesBox.id,
			        _ColorBoxontanier:"cboxcLoadedContent"
	    		};

	    		//console.log('controlInput:', controlInput);

	    		if(rgb.r) { //if object currently has settings
	    			function rgbToHex(red, green, blue) {
					    var rgb = blue | (green << 8) | (red << 16);
					    return '#' + (0x1000000 + rgb).toString(16).slice(1)
					}
					//console.log('rgb:', rgb);
					controlInput._Color = rgbToHex(rgb.r, rgb.g, rgb.b);
					controlInput._xOffset = rgb.horiz.toString(); //something happneing here, turns undefined.
					controlInput._yOffset = rgb.vert.toString();
					controlInput._Opacity = rgb.opacity.toString();
					controlInput._Blur = rgb.blurSize.toString();
					//controlInput._DivContanier: "";
	    		}

	    		//load cmg
	    		var shadowControl = new layerControls(controlInput);
	    		//prop = [];
			    //dt = [];

	    		var testFunction = function() {
			    	console.log('shadowControl:', shadowControl); //shows that this function has access to shadowControl and it's properties.
			    	prop = []; 
			    	dt = [];

			        function hexToRgb(hex) {
						var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
						return result ? {
							r: parseInt(result[1], 16),
							g: parseInt(result[2], 16),
							b: parseInt(result[3], 16)
						} : null;
					}
					var tmp = hexToRgb(shadowControl.colorShadow);
					rgb.r = tmp.r;
					rgb.g = tmp.g;
					rgb.b = tmp.b;
					rgb.opacity = shadowControl.opacityShadow.toString();
					//rgb.opacity = get('opacityShadow').toString();
					rgb.blurSize = shadowControl.blurShadow.toString();
					//rgb.blurSize = get('blurShadow').toString();
					rgb.vert = shadowControl.yOffsetShadow.toString(); //does not work ...but why?
					//rgb.vert = get('yOffsetShadow').toString(); //does not work ...but why?

					//rgb.vert = dt[1].toString(); //WORKS! ...but why?
					rgb.horiz = shadowControl.xOffsetShadow.toString();
					//rgb.horiz = get('xOffsetShadow').toString();
					console.log('shadowControl: rgb:', rgb);
					setSettings();
					fabCanvas.renderAll();
	    		};

			    shadowControl._ChangeHandlerFunction = testFunction;

	    		shadowCreatorExpanded.css({
	    			'display': 'block',
	    		});
	    	});
	    	return shadowCreatorDiv;
	    	/*return $jConstruct('div', {
	    		text: 'coming soon!',
	    	});*/
	    };

	    //determines what kind of jsonHTML object to use for each property.
	    var add2DB = function(value, variable) {
	    	var tmpDiv;
		    if(value.indexOf('Color') > -1 || value.indexOf('fill') > -1) {
		    	tmpDiv = tmpConstruct(colorObj(value, variable));
		    } else if(value == 'fontFamily') {
		    	tmpDiv = tmpConstruct(fontPickerObj(value, variable)); //add as a fontPicker object to this db.
		    } else if(value == 'fontSize') {
		    	tmpDiv = tmpConstruct(fontSizeSpinner(value, variable));
		    } else if (value == 'fontWeight') {
		    	tmpDiv = tmpConstruct(fontWeightSelect(value, variable));
		    } else if(value == 'fontStyle') {
		    	tmpDiv = tmpConstruct(fontStyleSelect(value, variable));
		    } else if(value == 'textDecoration') {
		    	tmpDiv = tmpConstruct(textDecorationSelect(value, variable));
		    } else if (value == 'textAlign') {
		    	tmpDiv = tmpConstruct(textAlignSelect(value, variable));
		    } else if (value == 'width') {
		    	tmpDiv = tmpConstruct(widthSpinner(value, variable));
		    } else if (value == 'height') {
		    	tmpDiv = tmpConstruct(heightSpinner(value, variable));
		    } else if (value == 'shadow') {
		    	tmpDiv = tmpConstruct(shadowCreator(value, variable));
		    } else {
		    	tmpDiv = tmpConstruct(txtObj(value, variable)); //add as text object to this db.
		    }
		    return tmpDiv;
	    };


	    //structured so that I can use a loop and go through the filters easily.
	    var filters = {
	    	advanced: { //If the option is not something that the usual user will utilize, put it as an advanced option.
	    		func: function(value, variable) {
			    	var advancedFilter = [];
			    	if(projDB.get(id).type == 'image') {
			    		advancedFilter = ['name', 'Color', 'current', 'scale', 'fill', 'opacity', 'angle'];
			    	} else {
			    		advancedFilter = ['name', 'Color', 'current', 'text', 'stroke', 'scale', 'fill', 'font', 'opacity', 'angle', 'shadow'];
			    	}
			    	for(var i = 0; i < advancedFilter.length; ++i) {
			    		if(value.indexOf(advancedFilter[i]) == -1 || value === 'width') {
			    			this.objs[this.objs.length] = add2DB(value, variable);
			    		}
			    	}
			    },
	    		objs: [],
	    	},
	    	font: {
	    		func: function(value, variable) {
			    	var fontFilter = [];
			    	if(projDB.get(id).type != 'image') {
			    		fontFilter = ['font', 'text', 'shadow'];
			    	}
			    	for(var i = 0; i < fontFilter.length; ++i) {
			    		if(value.indexOf(fontFilter[i]) != -1) {
			    			this.objs[this.objs.length] = add2DB(value, variable);
			    		}
			    	}
			    },
	    		objs: [],
	    	},
	    	dimension: {
	    		func: function(value, variable) {
			    	var dimensFilter = [];
			    	if(projDB.get(id).type == 'image') {
			    		dimensFilter = ['scale', 'width', 'height'];
			    	} else {
			    		dimensFilter = ['scale', 'width', 'height'];
			    	}
			    	for(var i = 0; i < dimensFilter.length; ++i) {
			    		if(value.indexOf(dimensFilter[i]) != -1) {
			    			this.objs[this.objs.length] = add2DB(value, variable);
			    		}
			    	}
			    },
	    		objs: [],
	    	},
	    	color: {
	    		func: function(value, variable) {
			    	var colorFilter = [];
			    	if(projDB.get(id).type == 'image') {
			    		colorFilter = ['Color'];
			    	} else {
			    		colorFilter = ['Color', 'fill'];
			    	}
			    	for(var i = 0; i < colorFilter.length; ++i) {
			    		if(value.indexOf(colorFilter[i]) != -1) {
			    			this.objs[this.objs.length] = add2DB(value, variable);
			    		}
			    	}
			    },
	    		objs: [],
	    	}
	    };

	    /*
			END OF FILTER FUNCTIONS.
	    */

	    //makes all the div's representing the user-editable properties of that canvas object.
	    //var advancedOptions = [];
	    var isOpen = [];
	    var previous = { //remembers the state of the previous object.
	    	obj: undefined,
	    	index: 0,
	    	//value: undefined,
	    	children: [],
	    };
	    var addProperty = function(value) {
		    isOpen[isOpen.length] = {
		    	open: false,
		    	val: value,
		    };
		    var getIndex = function(key) {
		    	for(var i = 0; i < isOpen.length; ++i) {
		    		if(isOpen[i].val == key) {
		    			//blOpen = isOpen[i].open;
		    			return i;
		    		}
		    	}
		    	return -1;
		    };
		    var emptyIt = function(mutableDiv) {
		    	if(undefined !== previous.children) {
			    	if(previous.children.length > 0) {
			    		for(var i = 0; i < previous.children.length; ++i) {
			    			$('#'+previous.children[i].id).remove();
			    		}
			    		previous.children = [];
			    	}
		    	}
		    	
		    	if(undefined !== previous.obj) {
			    	if(previous.obj.id != mutableDiv.id) {
						if(previous.index >= 0 && previous.obj) {
				    		console.log(isOpen[previous.index].val, 'set to false');
				    		isOpen[previous.index].open = false;
				    		//var prevObj = arrdb.get(previous.id);
				    		previous.obj.text = previous.obj.text.substring(1, previous.obj.text.length);
				    		previous.obj.refresh();
				    	}				    	
			    	}
		    	}
		    };

		    //if the property is selected, it will have an arrow in front of it's title.
		    //this arrow is removed by the getValue function so it can be used as a key.
		    var getValue = function(key) {
		    	if(key.indexOf('>') > -1) {
		    		key = key.substring(1, key.length);
		    	}
		    	return key;
		    };

	    	var objectProperty = $jConstruct('div', {
	    		text: value,
	    		class: 'selectable',
	    	}).css(editWindow.css.propertyClassObject).event('click', function() {
	    		emptyIt(objectProperty);
		    	var blOpen; //make sure that it does not try to render again.
		    	var index = getIndex(getValue(objectProperty.text)); //get index of objects stored property in the isOpen array.
		    	previous.index = index;
		    	previous.obj = objectProperty;
		    	//console.log('click:', isOpen, isOpen[index]);
		    	if(isOpen[index].open === false) { //if the object is not already open.
		    		objectProperty.text = '>' + value;
		    		isOpen[index].open = true;
		    		objectProperty.refresh();
		    		var tmpFix = "";
		    		for(var i = 0; i < filters[value].objs.length; ++i) {
		    			if(tmpFix !== filters[value].objs[i].children[0].text) {
		    				tmpFix = filters[value].objs[i].children[0].text;
		    				filters[value].objs[i].appendTo(propertiesBoxID);
		    				previous.children[previous.children.length] = filters[value].objs[i];
		    			}
		    		}
		    	} else { //remove the objects that were added previously
		    		console.log('else!');
		    		emptyIt(objectProperty);
		    		isOpen[index].open = false;
		    	}
	    	});
	    	return objectProperty;
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
	    var renderRefProp = function(refPropDivID) {
		    $(refPropDivID).empty(); //already has the '#.'

		    var addProperties = function() {
		    	var dfd = new $.Deferred();
			    setTimeout(function() {
			    	var obj = projDB.get(selected); //gets the current object which is selected on the canvas.
			    	/*
						k carries a string; the name of each property in obj.
						obj[k] equivalent to obj['propertyName']
			    	*/
			    	for(var k in obj) { //loops through the properties of the current selected object.
				        if(check(k, obj)) { //check if this is something that should be accessible to the user.
				        	/*
								o carries a string; the name of each property in filters.
								filters[o] grabs the function within filters.
								filter[o](k, obj) executes the function.
				        	*/
				        	for(var o in filters) {
				        		filters[o].func(k, obj); //execute the filter.
				        	}
				        }
			    	}
			    	/*
						Loop through each filter type.
						Create and add the DIV elements which represent each different classification for the object.
			    	*/
			    	for(var k in filters) {
			    		addProperty(k).appendTo(refPropDivID);
			    	}

			    	dfd.resolve();
			    }, 250);//delays the loading of the properties by 250ms.
			    return dfd.promise();
		    }
		    addProperties();
	    };
	    var renderSelection = function(fbJsObjID, refDivID, refPropDivID) {
	    	if(fabCanvas.getActiveObject()) {
	    		//edit window does not need to be rendered again, if it was already rendered properly.
		    	if(fabCanvas.getActiveObject().type != editWindow.lastObjType) {
		    		editWindow.lastObjType = fabCanvas.getActiveObject().type;
		    		editWindow.populate(fabCanvas.getActiveObject(), editWindow.contentBox.instance.id, editWindow.contentPropertiesBox.instance.id);
		    	}
	    	}
	    	renderRefProp(refPropDivID);
	    	referenceObjectSelect(refDivID, fbJsObjID);
	    };
	    var fillRefObjDiv = function(fbJsObjID, refDivID, refPropDivID) {
	    	var refObjDiv = $jConstruct('div', {
	    		id: refDivID,
	    		name: 'projectObject',
	    		text: (function() {
	    			if(projDB.get(fbJsObjID).name == 'name not defined') { //If the object is named, display it.
	    				return fbJsObjID;
	    			} else {
	    				return projDB.get(fbJsObjID).name;
	    			}
	    		})(),
	    	}).event('click', function() {
	    		console.log('Clicked:', fbJsObjID, 'Selected:', selected);
	    		if(fbJsObjID !== selected) {
	    			fabCanvas.setActiveObject(projDB.get(fbJsObjID)); //will trigger the 'selected' listener/handler on the object, which activates the function.
	    		}
	    	}).css(editWindow.css.propertyObject);
	    	var activeObject = fabCanvas.getActiveObject();
	    	if(activeObject) {
		    	if(id == activeObject.id) { //if there is an object already selected on the canvas.
		    		refObjDiv.css({
		    			'background-color': '#ADADAD',
		    		}).addFunction(function() {
		    			renderSelection(id, refDivID, propertiesBoxID);
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
	    var refObjDiv = fillRefObjDiv(id, refObjDivID, propertiesBoxID);
	    refObjDiv.appendTo('#'+editWindow.contentBox.instance.id); //append the reference object div to the contentBox.
	},

	load: function() {
		//open the colorbox so the rest of the loading can begin.
		editWindow.openColorbox();
		var contentBox = editWindow.contentBox.create();
		var contentPropertiesBox = editWindow.contentPropertiesBox.create();

		//allows for the correct order of rendering.
		editWindow.handle.create().appendTo('#cbCustom');
		editWindow.imgButtons.settings.create(contentBox, contentPropertiesBox).appendTo('#cbCustom');
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

		editWindow.draggableExclusions.register('input');
		editWindow.draggableExclusions.register('textarea');
		editWindow.draggableExclusions.register('select');
		editWindow.draggableExclusions.register('spinner');
		editWindow.draggableExclusions.register('img');
		editWindow.draggableExclusions.register('#fontPicker');
		editWindow.draggableExclusions.register('#' + contentBox.id);
		editWindow.draggableExclusions.register('#' + contentPropertiesBox.id);
		//editWindow.draggableExclusions.register('#shadowCreatorExpanded');

		//Allows the colorbox to be moved. Exclude the content box and properties box as a draggable source.
		$('#colorboxCustom').tinyDraggable({
			handle:'#cboxcContent', 
			exclude: editWindow.draggableExclusions.constructString(), //Set the registered exclusions.
		});
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
