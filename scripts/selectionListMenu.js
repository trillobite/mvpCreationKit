
/*
	FILE: 
		SELECTIONLISTMENU.JS
	DESCRIPTION: 
		Constructed as a function to allow the programmer to call with
		the 'new' command. Opens a specific colorbox in order to allow
		the user to view all the objects currently on the canvas.
	AUTHOR: 
		             (
		         )   )
		         (
		     .---------------------.
		     |        _____        |___      
		     |     .'`_,-._`'.      __ \
		     |    /  ( [ ] )  \    |  ||
		     |   /.-""`( )`""-.\   |  ||
		     |  ' <'```(.)```'> '  | _||
		     |    <'```(.)```'>    |/ _/
		2    |     <'``(.)``'>      ./
		0    |      <``\_/``>      |
		1    |       `'---'`       |
		5    \github.com/trillobite/              
		       \_________________/      Keep it black
	COPYRIGHT: 
		MVP = MULTI VISUAL PRODUCTS.
		FOR USE AND OWNED BY MVP, USE IS RESTRICTED UNLESS
		PERMISSION GRANTED FROM MVP. SOFTWARE SHOULD NOT BE
		SOLD OR DISTRIBUTED UNLESS PERMISSION GRANTED FROM MVP.
*/
//Initiates as a function as to allow the user to use the new command.
var lstMenu =  {
		open: function() {
			//open the listMenu by calling the respective colorbox.
			$.listerColorbox({
		        html: '<div id="lsCustom" style="width:100%;height:100%;"></div>',
		        width: '350',
		        height: '500',
		        //opacity: '0.5',
		        top: '20%',
		        left: '65%',
		        overlayClose: false
		    });
		    $('#listerColorbox').tinyDraggable({
				handle:'#lCboxContent', 
				exclude: editWindow.draggableExclusions.constructString(), //Set the registered exclusions.
			});
			$('#lCboxOverlay').remove();
			$('#listerColorbox').jScroll();
			/*var w = parseInt($('#'+contentBox.id).width()) + 70;
			var h = parseInt(editWindow.css.contentBox['height']) + parseInt(editWindow.css.contentPropertiesBox['height']) + 100;
			//$('#cboxcContent').css({'opacity': '0.7'});
			$.listerColorbox.resize({width: w.toString(), height: h.toString()});*/

		},
		dbToArr: function(input) {
			console.log('dbToArr, input:', input);
			var arr = [];
			var addArray = function(obj) {
				for(var i = 0; i < obj.length; ++i) {
					arr[arr.length] = obj[i];
				}
			};
			if(toolKit().getType(input) == 'array') {
				for(var i = 0; i < input.length; ++i) {
					if(toolKit().getType(input[i]) == 'array') {
						addArray(this.dbToArr(input[i]));
					} else {
						arr[arr.length] = input[i];
					}
				}
			} else {
				arr[arr.length] = input;
			}
			return arr;
		},
		/*
			Function: 
				sortArr
			Description:
				Takes the output from micronDB, and can sort the data according
				to a specified parameter. Returns a single-dimensional array.
			Input:
				{
					sort: 'lowest',
					sortProperty: 'index',
					//sortObjType: 'int', //'int,' or 'alpha,' for intiger or alphanumeric.
					arr: [undefined, undefined] //array to be sorted and returned.
				}
			Note:
				Currently only set to handle integers.
		*/
		sortArr: function(input) {
			var sorted = [];
			var sortArr = input.arr;
			var findNext = function(tmp) {
				var tmpStore = undefined;
				var index = undefined;
				if(tmp) { //if the input object is not undefined.
					for(var i = 0; i < tmp.length; ++i) {
						if(tmpStore) { //if tmpStore has something in it.
							if(input.sort == 'lowest') { //if sorting will start with the lowest value.
								if(tmpStore[input.sortProperty] > tmp[i][input.sortProperty]) {
									tmpStore = tmp[i]; //store the one with the smaller value.
									index = i;
								}
							} else if(input.sort == 'highest') { //if sorting will start with the highest value.
								if(tmpStore[input.sortProperty] < tmp[i][input.sortProperty]) {
									tmpStore = tmp[i]; //store the one with the larger value.
									index = i;
								}
							}
						} else {
							tmpStore = tmp[i]; //tmpStore has no value, store something in it.
						}
					}
				}
				return index; //returns undefined if tmp is undefined.
			};
			var stop = 1000 //1000 loops max.
			while(findNext(sortArr) || !stop) {
				--stop; //while loop will stop when this equals 0.
				var index = findNext(sortArr);
				sorted[sorted.length] = sortArr[index];
				delete sortArr[index];
			}
			return sorted;
		},
		dbToArrConvert: function(dbOutput) {
			var convertedArr = [];
			var recursive = function(arr) {
				for(var i = 0; i < arr.length; ++i) {
					if(toolKit().getType(arr[i]) == 'array') {
						recursive(arr[i]);
					} else {
						convertedArr[convertedArr.length] = arr[i];
					}
				}
			}
			return convertedArr;
		},
		//sorts objects according to what position it is in within the canvas stack.
		sortByStack: function(inputArr) {
			var dbArr = this.dbToArrConvert(inputArr);
			var sortArr = function(arr) {
				var sorted = [];	
				var findNext = function(inputArr) {
					var lowest = {
						obj: undefined,
						indx: undefined,
					};
					for(var i = 0; i < inputArr.length; ++i) {
						if(lowest.obj) { //if an object is assigned to lowest. Will be Undefined if the first loop.
							var indx = fabCanvas.getObjects().indexOf(inputArr[i]); //gets the index of the object within the canvas object array.
							if(indx <= lowest.indx) { //possible that it may have the same index on the canvas.
								lowest = {
									obj: inputArr[i],
									indx: i,
								};
								//sorted[sorted.length] = inputArr[i];
							}
						} else {
							lowest = {
								obj: inputArr[i],
								indx: i,
							};
							//sorted[sorted.length] = inputArr[i];
						}
					}
					return lowest;
				}
				var stop = 1000; //maximum number of loops.
				while(arr.length > 0 && !stop) { //stop when there are no items left in arr.
					--stop; //prevents an infinate loop.
					var lowest = findNext(arr); 
					sorted[sorted.length] = lowest.obj;
					delete arr[lowest.indx]; //delete found object from the array.
				}
				return sorted;
			};
			return sortArr(dbArr);
		},
		//sort the objects into their respective collections. Produces a two-dimensional array.
		sortIntoCollections: function(canvObjs) {

			
			var createCollections = function(objArr) {
				//var collectionTypes = [];
				var canvJSON = {
					undeclared: [],
				};
				for(var i = 0; i < objArr.length; ++i) {
					if(objArr[i].hasOwnProperty('collection')) { //check if it even has a collection property
						if(objArr[i].collection) { //is the collection property assigned
							//collectionTypes[collectionTypes.length] = objArr.collection;
							if(!canvJSON[objArr[i].collection]) {
								canvJSON[objArr[i].collection] = []; //make an array for that collection.
							}
							canvJSON[objArr[i].collection][canvJSON[objArr[i].collection].length] = objArr[i];
						} else {
							canvJSON.undeclared[canvJSON.undeclared.length] = objArr[i]; //if collection is undefined set to undeclared array.
						}
					} else {
						canvJSON.undeclared[canvJSON.undeclared.length] = objArr[i]; //if collection property does not exist add here.
					}
				}
				return canvJSON;
			};
			
			var collections = createCollections(canvObjs);
			/*for (var collection in collections) {
				collections[collection] = this.sortByStack(collections[collection]); //make sure all the objects are sorted in each collection.
			}*/

			console.log('canvJSON:', collections);
			return collections;
		},
		makeTiles: function(collections) {
			//console.log('collections:', collections);
			var tiles = [];
			
			for(var property in collections) { //for each object collection. (aka group).
				var tile = $jConstruct('div', {
					text: property,
				});

				//this is failing to execute.
				var container = $jConstruct('div').event('blur', function() {
					console.log('blur fired');
					//hide all tile children
					for(var i = 0; i < tile.children.length; ++i) {
						$('#'+tile.children[i].id).css({
							'display': 'none',
						});
						/*tile.children[i].css({
							'display': 'none',
						});*/
					}
				}).css({
					'border': '1px solid black',
					'border-radius': '3px',
				}).addChild(tile);

				var lastActive;
				var cmgHandlers = new micronDB();

				for(var i = 0; i < collections[property].length; ++i) {
					tile.addChild($jConstruct('div', {
						text: (function() {
							if(collections[property][i].type == 'text') {
								var text = collections[property][i].text;
								if(text.length > 10) { //if greater than 10 characters, return only 10 of those characters.
									return text.substring(0, 10);
								} else if (text.length <= 10) { //if less than or equal to 10 characters, just return the full string.
									return text;
								}
							} else {
								return collections[property][i].id;
							}
						})(),
						boundto: collections[property][i].id, //cannot be boundTo, always lowercases to boundto automatically.
						//text: collections[property][i].id,
					}).css({
						'border': '1px solid black',
						'border-radius': '3px',
						'display': 'none',
						'margin-left': '15px',
						//'height': '100px',
					}).event('click', function() {
						if(lastActive) {
							$('#'+lastActive).trigger('blur');
						}
						lastActive = this.id;
						/*arrdb.get(this.id).css({
							'height': '100px',
						});*/
						if(cmgHandlers.get(this.id)) { //get the original cmg handler for this div.
							cmgControl = cmgHandlers.get(this.id).control;
							cmgControl.startControl(projDB.get(arrdb.get(this.id).boundto));
						} else {
							shadoWindow.controlSettings._divowner = this.id;
							shadoWindow.controlSettings._DivContainer = this.id;
							var cmgControl = shadoWindow.controls();
							cmgHandlers.hash({
								id: this.id,
								control: cmgControl,
							});
							cmgControl.startControl(projDB.get(arrdb.get(this.id).boundto));

						}
						//var tmp = arrdb.get(this.id);
						//console.log('bound to:', arrdb.get(this.id).boundto);
						console.log('shadoWindow control:', shadoWindow.controlSettings);
					}).event('blur', function() {
						console.log(arrdb.get(this.id).boundto, 'blur fired');
						$('#divShadowCntrl').remove();
						/*arrdb.get(this.id).css({
							'height': 'auto',
						});*/
					}));
				}

				tile.event('click', function() {
					//console.log('id:', this.id);
					//show all child objects.
					var currentTile = arrdb.get(this.id);
					for(var i = 0; i < currentTile.children.length; ++i) {
						currentTile.children[i].css({
							'display': 'block',
						});
					}
					/*var w = parseInt($('#'+contentBox.id).width()) + 70;
					var h = parseInt(editWindow.css.contentBox['height']) + parseInt(editWindow.css.contentPropertiesBox['height']) + 100;
					$.listerColorbox.resize({width: w.toString(), height: h.toString()});*/
				});

				tiles[tiles.length] = container;
			}
			return tiles;
		},
		draw: function() {
			//sort all the objects to be contained in the listMenu.
			var canvObjs = this.dbToArr(projDB.query({
				where: {
					type: function(input) { //the value of the property type is taken into this function to be checked
						return input == 'image' || input == 'text'; //if the value is one of these, it returns true.
					},
				},
			}));
			console.log('canvObjs:', canvObjs);
			//sort the objects into their respective collections. Produces a two-dimensional array.
			var collections = this.sortIntoCollections(canvObjs);
			var tiles = this.makeTiles(collections);

			//open the custom colorbox
			this.open()
			//insert the tiles
			for(var i = 0; i < tiles.length; ++i) {
				tiles[i].appendTo('#lsCustom');
			}

		},
	
}