

/*
	File: newPicker.js
	Author: Jesse Parnell
	gitHub: github.com/trillobite

	DESCRIPTION:
	Produces a jsonHTML object which can be used to make custom font style selections using google's 
	font API. newPicker is a function, and created that way so the new command can be utilized to 
	create multiple font picker objects independent from one another. 

	The transform function will take an existing jsonHTML object, and convert it into a font picker
	(font select) object.

	The font picker is a jsonHTML object, and with this, jsonHTML will produce standard HTML 5.0 code
	which should be compatible with any and all browsers even into the future.

	COPYRIGHT 2015: 
	This code comes with no warranties or guarantee's, use at your own risk, author is not responsible
	for any expected or unexpected results of using this code.

	You may edit, modify, copy and redistribute this code, just maintain credit to me, and ensure that
	any modifications are documented by the name of the author who made the edit.

	Review your laws before attempting to use this code, I am not responsible for the use of this code
	in locations in which it may be banned.
*/


var _googleAPILoaded = false;

//Transform function within 'data,' can take an input of an existing jsonHTML object for transformations.
var newPicker = function() {
	var data = {
		//Default fonts pre-loaded so that the user does not have to define them.
		fonts: ['Open+Sans', 'Lora', 'Raleway', 'Inconsolata', 'Special+Elite', 'Alegreya+Sans', 'Great+Vibes', 'Tangerine'],
		//This will grab and use the google fonts API
		getGoogleAPI: function() { 
			if(!_googleAPILoaded) { //Ensures that the google API is only attempted to be loaded once.
				(function() { //code supplied by google.
					var wf = document.createElement('script');
					wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
					'://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
					wf.type = 'text/javascript';
					wf.async = 'true';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(wf, s);
				})();
				_googleAPILoaded = true;
			}
		},
		loadFonts: {
			fonts: function(f) {
				var dfd = new $.Deferred();
				WebFontConfig = { //creates a global variable that the API will utilize.
					google: { 
						families: data.convertFonts(f),
					},
				};
				data.getGoogleAPI();
			},
			active: function(onActive) {
				if(onActive) {
					onActive();
				}
			},
		},
		//This will convert the fonts specified, so that the API can use it to render fonts.
		convertFonts: function(f) { 
			data.fonts = f ? f : data.fonts; //Allows for a custom list of fonts.
			var tmp = [];
			for(var i = 0; i < data.fonts.length; ++i) {
				tmp[tmp.length] = data.fonts[i].replace(' ', '+') + '::latin';
			}
			return tmp;
		},
		//Returns an array of jConstructed option objects for a selection.
		renderOptions: function(inputFonts) {
			var options = [];
			var f = data.convertFonts(inputFonts);
			for (var i = 0; i < f.length; ++i) {
				var tmp = data.fonts[i].replace('+', ' '); //Make more legible for humans.
				options[i] = $jConstruct('option', {
					text: tmp, 
					value: tmp,
				}).css({
					'font-family': tmp,
				});
			}
			return options;
		},
		//Remove all Option type jConstruct children.
		cleanObject: function(input) {
			for(var i = 0; i < input.children.length; ++i) {
				if(input.children[i].type == 'option') {
					delete input.children[i]; //simply delete this child object from the children array.
				}
			}
			return input;
		},
		//Will allow for the transformation of an existing jsonHTML object.
		transform: function(input, type, f) {
			//data.loadFonts.fonts(f);
			if(type) {
				input.type = type;
				if(type == 'select') { //Add 'option' child objects.
					input = data.cleanObject(input); //clean object of existing font types.
					var options = data.renderOptions();
					for(var i = 0; i < options.length; ++i) {
						input.addChild(options[i]);
					}
				} else { //Check and make sure that all 'option' type children are removed.
					input = data.cleanObject(input);
				}
			}
			return input; //return the modified object.
		},
		//Will render a basic fontPicker object, without an object to transform.
		//f is a custom list of fonts to chose from. This can be undefined, as it will simply default.
		render: function(f) {
			//data.loadFonts.fonts(f);
			//create a select object, and return it, with all child 'option' objects.
			var fPicker = $jConstruct('select', {
				id: 'fontPicker',
			});
			var options = data.renderOptions(f);
			for(var i = 0; i < options.length; ++i) {
				fPicker.addChild(options[i]);
			}
			return fPicker;
		},
	};

	//Returned object must be able to randomly take an object as an input and transform it.
	return data;
};


/*
	THE SYNTAX THAT I WISH TO ACCOMPLISH:

	var picker = new newPicker();
	picker.render(fonts).appendTo('body');
	picker.transform(thisObject); //Will transform thisObject into a picker object.

            )
            
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
    |     <'``(.)``'>      ./
    |      <``\_/``>      |
    |       `'---'`       |
    \github.com/trillobite/              Keep it black.
      \_________________/  	
*/