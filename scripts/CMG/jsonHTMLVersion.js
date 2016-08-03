/*
	Attempting to polish up the UI for CMG Controls.
	The shadow-control object will be interacted with
	as if it were a single packaged object. The
	programmer will not have to touch any html in
	order to manipulate the shadow-control object.

	Attempting to make everything self contained.


	This control requires these libraries:
	http://code.jquery.com/jquery-1.10.2.min.js
	jquery-ui.js
	evol.colorpicker.js
	jsonHTML.js

	The required style sheets 
	CMG_Controls_Styles.css
	evol.colorpicker.min.css
	jquery-ui.css
*/

// optional constructor
/*{
    _xOffset: "integer",
    _yOffset: "integer",
    _Color: "hex color value",
    _Opacity: "integer",
    _Blur: "integer",
    //_divowner: "string",
    _DivContanier: "string",
    _ColorBoxontanier: "string",
    handlerFunction: "function",
}*/

var layerControls = function(jsonInput) {
	var control = {};
	control.cmg_functions = {};
	control.domElements = {};
	control.isMouseDown = false;
	control.properties = {
		debugMode: true,
		xOffsetShadow: undefined,
		yOffsetShadow: undefined,
		opacityShadow: 0.7,
		blurShadow: 4,
		distanceShadow: 0,
		angleShadow: 0,
		divcontainer: undefined,
		divcolorbox: undefined,
		handlerFunction: undefined, //executes when a change happens.
	};
<<<<<<< HEAD
	control.properties.update = function(obj) { 
		if(this.debugMode) {
			console.log('update:', obj);
=======
	control.properties.update = function(obj) {
		if(control.properties.debugMode) {
			console.log('update');
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		}
		for(var value in obj) {
			this[value] = obj[value];
		}
	};
	control.properties.rgb = { r: 0, g: 0, b: 0};
	control.properties.setRGBA = function(rgba) {
		if(control.properties.debugMode) {
			console.log('setRGBA');
		}
		var tmp = { rgb: {} };
		var colors = rgba.color.substring(rgba.color.indexOf('(') + 1, rgba.color.indexOf(')'));
		tmp.rgb.r = colors.substring(0, colors.indexOf(','));
		colors = colors.substring(colors.indexOf(',') + 1, colors.length);
		tmp.rgb.g = colors.substring(0, colors.indexOf(','));
		colors = colors.substring(colors.indexOf(',')+1, colors.length);
		tmp.rgb.b = colors.substring(0, colors.indexOf(','));
		colors = colors.substring(colors.indexOf(',')+1, colors.length);
		tmp.opacityShadow = colors;
		tmp.xOffsetShadow = rgba.offsetY;
		tmp.yOffsetShadow = rgba.offsetX;
		tmp.distanceShadow = rgba.blur;
		control.properties.update(tmp); //update the properties within control.	
	};
	control.properties.getRGBA = function() {
		if(control.properties.debugMode){
		    console.log('getRGBA');	
		}
		var shadowStr = 'rgba(';
		shadowStr += control.properties.rgb.r + ',';
		shadowStr += control.properties.rgb.g + ',';
		shadowStr += control.properties.rgb.b + ',';
		shadowStr += control.properties.opacityShadow.toString() + ') ';
		shadowStr += control.properties.xOffsetShadow.toString() + 'px ';
		shadowStr += control.properties.yOffsetShadow.toString() + 'px ';
		shadowStr += control.properties.blurShadow.toString() + 'px';
		//shadowStr += control.properties.distanceShadow.toString() + 'px';
		return shadowStr;
	};
	control.properties.setRGB = function(obj) {
		if(control.properties.debugMode){
		    console.log('setRGB');	
		}
		function rgbToHex(red, green, blue) {
		    var rgb = blue | (green << 8) | (red << 16);
		    return '#' + (0x1000000 + rgb).toString(16).slice(1);
		}
		control.properties.rgb = obj;
		control.properties.shadowColor = rgbToHex(obj.r, obj.g, obj.b);
	};
	control.properties.getHexColor = function() {
		if(control.properties.debugMode){
		    console.log('getHexColor');	
		}
		function rgbToHex(red, green, blue) {
			var rgb = blue | (green << 8) | (red << 16);
			return '#' + (0x1000000 + rgb).toString(16).slice(1);
		};
		var rgb = control.properties.rgb;
		return rgbToHex(rgb.r, rgb.g, rgb.b);
	};
	control.properties.setHexColor = function(input) {
<<<<<<< HEAD
		/*if(control.properties.debugMode){
		    console.log('setHexColor');	
		}*/
=======
		if(control.properties.debugMode){
		    console.log('setHexColor');	
		}
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : null;
		};
		var rgb = hexToRgb(input);
		var tmp = ['r', 'g', 'b']; //properties needing to be updated.
		for(var i = 0; i < tmp.length; ++i) { //update the rgb values.
			control.properties.rgb[tmp[i]] = rgb[tmp[i]];
		}
<<<<<<< HEAD
		if(control.properties.debugMode){
		    console.log('setHexColor:', control.properties.rgb);
		}
=======
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	};
	
	control.cmg_functions.rotateAnimation = function(img, degrees) {
		if(control.properties.debugMode){
		    console.log('rotateAnimation', $('#'+img.id)[0]);	
		}
		img = $('#'+img.id)[0];
		//console.log('img:', img, 'degrees:', degrees);
		if (navigator.userAgent.match("Chrome")) {
		    img.style.WebkitTransform = "rotate(" + degrees + "deg)";
		} else if (navigator.userAgent.match("Firefox")) {
		    img.style.MozTransform = "rotate(" + degrees + "deg)";
		} else if (navigator.userAgent.match("MSIE")) {
		    img.style.msTransform = "rotate(" + degrees + "deg)";
		} else if (navigator.userAgent.match("Opera")) {
		    img.style.OTransform = "rotate(" + degrees + "deg)";
		} else {
		    img.style.transform = "rotate(" + degrees + "deg)";
		}
	};
	control.cmg_functions.convertOffsetsToAngleDistance = function(OffsetX, OffsetY) {
		if(control.properties.debugMode){
		    console.log('convertOffsetsToAngleDistance');	
		}
		var angle = 0;
		var Distance = 0;
		var RadToDegree = 360 / (2 * Math.PI);

		if (OffsetX == 0 && OffsetY == 0) {
		    //upperright quad
		    //defaults apply
		} else if (OffsetX >= 0 && OffsetY >= 0) {
		    //upperright quad
		    if (OffsetY == 0) {
		        angle = 90;
		    } else {
		        angle = RadToDegree * Math.atan(OffsetX / OffsetY);
		    }
		} else if (OffsetX >= 0 && OffsetY < 0) {
		    //lowerright quad
		    angle = 180 + (RadToDegree * Math.atan(OffsetX / OffsetY));
		} else if (OffsetX <= 0 && OffsetY < 0) {
		    //lowerleft quad
		    angle = 180 + (RadToDegree * Math.atan(OffsetX / OffsetY));
		} else if (OffsetX <= 0 && OffsetY >= 0) {
		    //Upper left quad
		    if (OffsetY == 0) {
		        angle = 270;
		    } else {
		        angle = 360 + (RadToDegree * Math.atan(OffsetX / OffsetY));
		    }
		}
		Distance = Math.sqrt(Math.pow(OffsetX, 2) + Math.pow(OffsetY, 2));
		return {
		    angle: angle,
		    Distance: Distance
		};		
	};
<<<<<<< HEAD
	//error: Distance = NaN
	control.cmg_functions.convertAngleDistanceToOffsets = function(angle, Distance) {
		if(control.properties.debugMode){
		    console.log('convertAngleDistanceToOfssets');
		    console.log('angle:', angle, 'Distance:', Distance);	
		}		

=======
	control.cmg_functions.convertAngleDistanceToOffsets = function(angle, Distance) {
		if(control.properties.debugMode){
		    console.log('convertAngleDistanceToOfssets');	
		}
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		var RadToDegree = 360 / (2 * Math.PI);
		var OffsetX = Math.round(Distance * Math.abs(Math.sin(angle / RadToDegree)));
		var OffsetY = Math.round(Distance * Math.abs(Math.cos(angle / RadToDegree)));

		if (angle >= 0 && angle <= 90) {
		    //default positive
		} else if (angle > 90 && angle <= 180) {
		    OffsetY = -1 * OffsetY;
		} else if (angle > 180 && angle <= 270) {
		    OffsetX = -1 * OffsetX;
		    OffsetY = -1 * OffsetY;
		} else if (angle > 270 && angle < 360) {
		    OffsetX = -1 * OffsetX;
		}
<<<<<<< HEAD

		if(control.properties.debugMode){
		    console.log('OffsetX:', OffsetX, 'OffsetY:', OffsetY);	
		}

=======
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		return {
		    OffsetX: OffsetX,
		    OffsetY: OffsetY
		};
	};
	//calculate angle from mouse cursor position
	control.cmg_functions.GetImageShadowDirection = function(object, e, divcolorbox, divcontainer) {
		if(control.properties.debugMode){
		    console.log('GetImageShadowDirection', object);	
		}
		object = $('#'+object.id)[0]; //get the DOM element using jQuery.
		//console.log('object:', object, 'e:', e, 'divcolorbox:', divcolorbox, 'divcontainer:', divcontainer);
		//var parentPosition = getPosition(e.currentTarget);
		var parentPosition = control.cmg_functions.getPosition(object, divcolorbox, divcontainer);
		var xPosition = e.clientX - parentPosition.x;
		var yPosition = e.clientY - parentPosition.y;
		//console.log(parentPosition.data);

		var _xloc = xPosition - object.width / 2;
		//Setting y positive directio to up
		var _yloc = 1 - (yPosition - object.height / 2);

		var RadToDegree = 360 / (2 * Math.PI);
		var angle = Math.atan(_xloc / _yloc);

		if (_xloc >= 0 && _yloc >= 0) {
		    //upperright quad
		    if (_yloc == 0) {
		        angle = 90;
		    } else {
		        angle = RadToDegree * angle;
		    }
		} else if (_xloc >= 0 && _yloc < 0) {
		    //lowerright quad
		    angle = 180 + (RadToDegree * angle);
		} else if (_xloc <= 0 && _yloc < 0) {
		    //lowerleft quad
		    angle = 180 + (RadToDegree * angle);
		} else if (_xloc <= 0 && _yloc >= 0) {
		    //Upper left quad
		    if (_yloc == 0) {
		        angle = 270;
		    } else {
		        angle = 360 + (RadToDegree * angle);
		    }
		}
		control.properties.angleShadow = parseInt(angle);
		var values = control.cmg_functions.convertAngleDistanceToOffsets(control.properties.angleShadow, control.properties.distanceShadow);
		control.properties.xOffsetShadow = values.OffsetX;
		control.properties.yOffsetShadow = values.OffsetY * -1;
		$("#txtShadowAngle").val(parseInt(angle));
		control.cmg_functions.rotateAnimation(object, angle);
		/*control.rgba.horiz = control.properties.xOffsetShadow;
		control.rgba.vert = control.properties.yOffsetShadow;*/
		if(control.properties.debugMode){
		    console.log('xOffset:', control.properties.xOffsetShadow);
		    console.log('yOffset:', control.properties.yOffsetShadow);	
		}
		control.properties.handlerFunction();
	};
	control.cmg_functions.getPosition = function(element, divcolorbox, divcontainer) {
		var xPosition = 0;
		var yPosition = 0;
		var elementdata = "";

		//adjustment for scroll in user code
		var st = 0;
		var sl = 0;
		if ($("#" + divcontainer).length > 0) {
		    var st = $("#" + divcontainer)[0].scrollTop;
		    var sl = $("#" + divcontainer)[0].scrollLeft;
		}
		xPosition = xPosition - sl;
		yPosition = yPosition - st;

		//colorbox adjustment
		st = 0;
		sl = 0;
		if ($("#" + divcolorbox).length > 0) {
		    var st = $("#" + divcolorbox)[0].scrollTop;
		    var sl = $("#" + divcolorbox)[0].scrollLeft;
		}
		xPosition = xPosition - sl;
		yPosition = yPosition - st;

		while (element) {
		    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
		    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
		    elementdata += "|" + element.id + "," + element.offsetTop + "," + element.scrollTop + "," + element.clientTop;
		    element = element.offsetParent;
		}

		return { x: xPosition, y: yPosition, data: elementdata };
	};
	
	control.domElements.imgShadowControl = $jConstruct('img', {
		objectName: 'imgShadowControl',
<<<<<<< HEAD
		src: 'css/images/ArrowCircle.png',
=======
		src: 'ArrowCircle.png',
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		alt: 'ArrowCircle.png',
	}).css({
		'float': 'left',
	}).event('mousemove', function(e) {
		if(control.isMouseDown) {
			control.cmg_functions.GetImageShadowDirection(control.domElements.imgShadowControl, e, control.properties.divcolorbox, control.properties.divcontainer);
			control.domElements.txtShadowAngle.text = control.properties.angleShadow;
			control.domElements.txtShadowAngle.refresh();
		}
	}).event('mousedown', function(e) {
		//prevent default mousedown behavior
		e.preventDefault();
		control.isMouseDown = true;
		control.cmg_functions.GetImageShadowDirection(control.domElements.imgShadowControl, e, control.properties.divcolorbox, control.properties.divcontainer);
		control.domElements.txtShadowAngle.text = control.properties.angleShadow;
		control.domElements.txtShadowAngle.refresh();
	}).addFunction(function() {
		control.cmg_functions.rotateAnimation(control.domElements.imgShadowControl, control.properties.angleShadow);
	});

	control.domElements.txtShadowAngle = $jConstruct('textbox', {
		objectName: 'txtShadowAngle',
		class: 'shadoValueBox',
<<<<<<< HEAD
		text: Math.round(control.properties.angleShadow).toString(),
=======
		text: control.properties.angleShadow,
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		readonly: 'readonly',
	}).css({
		'width': '30px',
		'float': 'left',
	});

	control.domElements.txtOpacityValue = $jConstruct('textbox', {
		id: 'ShadowOpacityValue',
<<<<<<< HEAD
		text: Math.round(control.properties.opacityShadow * 100).toString(),
=======
		text: Math.round(control.properties.opacityShadow * 100),
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		readonly: 'readonly',
		class: 'shadoValueBox',
	});

	control.domElements.txtBlurValue = $jConstruct('textbox', {
		objectName: 'ShadowBlurValue',
<<<<<<< HEAD
		text: Math.round(control.properties.blurShadow).toString(),
=======
		text: Math.round(control.properties.blurShadow),
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		readonly: 'readonly',
		class: 'shadoValueBox',
	});

<<<<<<< HEAD
	console.log('distanceShadow:', control.properties.distanceShadow);
	control.domElements.txtDistanceValue = $jConstruct('textbox', {
		text: Math.round(control.properties.distanceShadow).toString(),
=======
	control.domElements.txtDistanceValue = $jConstruct('textbox', {
		text: Math.round(control.properties.distanceShadow),
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		readonly: 'readonly',
		class: 'shadoValueBox',
	});

<<<<<<< HEAD
	
=======
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	control.domElements.colorInput = $jConstruct('input', {
		objectName: 'shadowColor',
		class: 'inputElementSizing'
	}).addFunction(function() {
		var shadowColor = control.domElements.colorInput;
		//setup colorpicker
		$('#'+shadowColor.id).colorpicker({
			defaultPalette: 'web',
			hideButton: true,
			history: false,
		});

		$('#'+shadowColor.id).colorpicker('val', control.properties.getHexColor());
		$('#'+shadowColor.id).css('background-color', control.properties.getHexColor());
		$('#'+shadowColor.id).css('color', control.properties.getHexColor());

		$('#'+shadowColor.id).on('change.color', function (event, color) {
			$('#'+shadowColor.id).css('background-color', color);
			$('#'+shadowColor.id).css('color', color);
			control.properties.setHexColor(color); //this will probably throw a bug here.
			console.log('shadowColor:', color);
			//control.properties.setHexColor(color);
			//control.rgba.setColorWithHex(color);
			control.properties.handlerFunction(); //this will probably throw a bug here.
		});
	}).event('click', function() {
<<<<<<< HEAD
		//$('#ShadowColor').colorpicker('showPalette');
		$('#'+control.domElements.colorInput.id).colorpicker('showPalette');
=======
		$('#ShadowColor').colorpicker('showPalette');
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	});

	control.domElements.slider2 = $jConstruct('div', {
		objectName: 'slider2',
	}).addFunction(function() { //will execute function after object is appended to DOM.
		$('#'+control.domElements.slider2.id).slider({ //turn this div into a slider.
			min: 0,
			max: 30,
			range: "min",
			value: control.properties.distanceShadow,
			//value: $('#'+control.domElements.slider2.id)[0].value,
			slide: function (event, ui) {
				control.domElements.txtDistanceValue.text = ui.value;
				control.domElements.txtDistanceValue.refresh();

				$('#'+control.domElements.slider2.id)[0].value = ui.value;
				control.properties.distanceShadow = ui.value;
				var values = control.cmg_functions.convertAngleDistanceToOffsets(control.properties.angleShadow, control.properties.distanceShadow);
				control.properties.xOffsetShadow = values.OffsetX;
				control.properties.yOffsetShadow = values.OffsetY * -1;
				/*control.domElements.txtShadowAngle.text = control.properties.distanceShadow;
				control.domElements.txtShadowAngle.refresh();*/
				control.properties.handlerFunction();
			}
		});
	});

	control.domElements.slider3 = $jConstruct('div', {
		objectName: 'slider3',
	}).addFunction(function() {
		$('#'+control.domElements.slider3.id).slider({
			min: 1,
			max: 100,
			range: "min",
			value: control.properties.opacityShadow * 100,
			//value: $('#'+control.domElements.slider3.id)[0].value,
			slide: function (event, ui) {
				control.domElements.txtOpacityValue.text = ui.value; //changes value of textbox.
				control.domElements.txtOpacityValue.refresh();
				$('#'+control.domElements.slider3.id)[0].value = ui.value;
				control.properties.opacityShadow = ui.value / 100;
				control.properties.handlerFunction();
			}
		});
	});

	control.domElements.slider4 = $jConstruct('div', {
		objectName: 'slider4',
	}).addFunction(function() {
		$('#'+control.domElements.slider4.id).slider({
			min: 0,
			max: 15,
			range: "min",
			value: control.properties.blurShadow,
			//value: $('#'+control.domElements.slider4.id)[0].value,
			slide: function (event, ui) {
				control.domElements.txtBlurValue.text = ui.value;
				control.domElements.txtBlurValue.refresh();
				//$('#'+control.domElements.slider4.id)[0].value = ui.value;
				control.properties.blurShadow = ui.value;
				control.properties.handlerFunction();
			}
		});
	});

<<<<<<< HEAD
	control.shadowCNTRL = function(values) { //constructs everything that we see on the screen.

		/*
			control.properties.distanceShadow = Math.round(values.Distance);
			control.properties.angleShadow = Math.round(values.angle);
		*/

		control.domElements.txtDistanceValue.text = Math.round(values.Distance).toString();
		control.domElements.txtShadowAngle.text = Math.round(values.angle).toString();

=======
	control.shadowCNTRL = function() { //constructs everything that we see on the screen.
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
		var elem = control.domElements;

		var divShadowCntrl = $jConstruct('div', {
			objectName: 'divShadowCntrl',
		}).addChild($jConstruct('div', {
			text: 'Layer Shadow',
		}).css({
			'text-align': 'center', 
			'background-color': '#000000', 
			'color': '#FFFFFF',
		})).css({
			'border': '2px solid #000000',
			//'width': '180px',				
		});

		//shadow control direction tools

		//I sometimes define a var just to make things easier to understand.
		var controlImage = $jConstruct('div', {
			objectName: 'controlImage',
		}).addChild(elem.imgShadowControl).css({
			'padding': '1px',
			'width': '38px',
		});

		var controlAngle = $jConstruct('div', {
			objectName: 'controlAngle',
		}).addChild(elem.txtShadowAngle);

		var colorControl = $jConstruct('div', {
			objectName: 'colorControl',
		}).addChild(elem.colorInput).css({
			'width': '38px', 
			'text-align': 'center',
		});

		var divShadowCntrlDirection = $jConstruct('div', {
			objectName: 'divShadowCntrlDirection',
		}).addChild(controlImage).addChild(controlAngle).addChild(colorControl).css({
			'display': 'inline-block',
			'vertical-align': 'top',
		});

		//add to the main div.
		divShadowCntrl.addChild(divShadowCntrlDirection);

		//shadow control slider tools

		var cntrlDistance = $jConstruct('div', {
			objectName: 'cntrlDistance',
			class: 'marginInlineBlock',
		}).css({
			'border': '1px solid #C0C0C0',
		}).addChild($jConstruct('div').addChild(elem.txtDistanceValue));


		var cntrlDistanceContainer = $jConstruct('div', {
			objectName: 'cntrlDistanceContainer',
		}).addChild($jConstruct('div', {
			objectName: 'divShadowDistanceHeader',
			text: 'Distance',
			class: 'centerAndBackground',
		})).addChild(cntrlDistance);

		cntrlDistanceContainer.addChild($jConstruct('div', {
			objectName: 'divShadowCntrlDistanceSlider',
			class: 'shadoSlider',
		}).addChild(elem.slider2));


		var cntrlOpacity = $jConstruct('div', {
			objectName: 'divShadowcntrlOpacity',
			class: 'solidBorderGray',
		});

		cntrlOpacity.addChild($jConstruct('div', {
			objectName: 'divShadowcntrlOpacityValue',
			class: 'marginInlineBlock',
		}).addChild(elem.txtOpacityValue));

		cntrlOpacity.addChild($jConstruct('div', {
			objectName: 'divShadowcntrlOpacitySlider',
			class: 'shadoSlider',
		}).addChild(elem.slider3));

		var cntrlShadowContainer = $jConstruct('div').addChild($jConstruct('div', {
			objectName: 'divShadowOpacityHeader',
			text: 'Opacity',
			class: 'centerAndBackground blackborderthin',
		})).addChild(cntrlOpacity);



		var cntrlBlur = $jConstruct('div', {
			objectName: 'divShadowCntrlBlur',
			class: 'solidBorderGray',
		});

		cntrlBlur.addChild($jConstruct('div', {
			objectName: 'divShadowCntrlBlurValue',
			class: 'marginInlineBlock',
		}).addChild(elem.txtBlurValue));

		cntrlBlur.addChild($jConstruct('div', {
			objectName: 'divShadowcntrlBlurSlider',
			class: 'shadoSlider',
		}).addChild(elem.slider4));

		var cntrlBlurContainer = $jConstruct('div').addChild($jConstruct('div', {
			objectName: 'divShadowBlurHeader',
			text: 'Blur',
			class: 'centerAndBackground blackborderthin',
		})).addChild(cntrlBlur);


		var divShadowCntrlSliders = $jConstruct('div', {
			objectName: 'divShadowCntrlSliders',
		}).addChild(cntrlDistanceContainer).addChild(cntrlShadowContainer).addChild(cntrlBlurContainer).css({
			'width': '80px', 
			'float': 'right',
			'display': 'inline-block', 
			'font-size': '10px',
		});

		divShadowCntrl.addChild(divShadowCntrlSliders);

		//divShadowCntrl.appendTo('#' + _divowner);
		return divShadowCntrl;
	};

	control.opacityCNTL = function() {
	    //level1
	    var divLayerOpacityValue = $jConstruct('div', {
	        id: 'divLayerOpacityValue'
	    }).addChild(LayerOpacityValue);

	    var SliderLayerOpacity = $jConstruct('div', {
	        id: 'SliderLayerOpacity'
	    });
	    //level2
	    var LayerOpacityValue = $jConstruct('textbox', {
	        id: 'LayerOpacityValue',
	        text: '0',
	        readonly: 'readonly'
	    }).addChild(divLayerOpacityValue);

	    var SliderLayerOpacity = $jConstruct('div', {
	        id: 'divLayerOpacitySlider'
	    }).addChild(SliderLayerOpacity);

	    //level3
	    var divLayerOpacityCntrl = $jConstruct('div', {
	        id: 'divLayerOpacityCntrl'
	    }).addChild(LayerOpacityValue).addChild(SliderLayerOpacity);

	    var divLayerOpacityHeader = $jConstruct('div', {
	        id: 'divLayerOpacityHeader',
	        text: 'Layer Opacity'
	    });

	    //level4
	    var _div = $jConstruct('div').addChild(divLayerOpacityHeader).addChild(divLayerOpacityCntrl);

	    var divLayerOpacityCntrl = $jConstruct('div', {
	        id: 'divLayerOpacityCntrlSlider'
	    }).addChild(_div);

	    //divLayerOpacityCntrl.appendTo('#' + _divowner);
	    return divLayerOpacityCntrl;
	};

	control.strokeCNTRL = function() {
	    var divStrokeCntrl = $jConstruct('div', {
	        id: 'divStrokeCntrl'
	    });
	    var divStrokeHeader = $jConstruct('div', {
	        id: 'divStrokeHeader',
	        text: 'Layer Stroke'
	    });
	    var divStrokeCntrlColor = $jConstruct('div', {
	        id: 'divStrokeCntrlColor'
	    });
	    var divStrokeColorCntrl = $jConstruct('div', {
	        id: 'divStrokeColorCntrl'
	    });
	    var StrokeColor = $jConstruct('textbox', {
	        id: 'StrokeColor',
	        class: 'colorPicker evo-cp0'
	    });
	    var divStrokeCntrlSlider = $jConstruct('div', {
	        id: 'divStrokeCntrlSlider'
	    });
	    var div1 = $jConstruct('div');
	    var divStrokeWidthHeader = $jConstruct('div', {
	        id: 'divStrokeWidthHeader',
	        text: 'Width'
	    });
	    var divStrokeCntrlWidth = $jConstruct('div', {
	        id: 'divStrokeCntrlWidth'
	    });
	    var divStrokeCntrlWidthValue = $jConstruct('div', {
	        id: 'divStrokeCntrlWidthValue'
	    });
	    var StrokeWidthValue = $jConstruct('textbox', {
	        id: 'StrokeWidthValue',
	        text: '0',
	        readonly: 'readonly'
	    });
	    var divStrokeCntrlWidthSlider = $jConstruct('div', {
	        id: 'divStrokeCntrlWidthSlider'
	    });
	    var StrokeSlider = $jConstruct('div', {
	        id: 'StrokeSlider'
	    });

	    divStrokeColorCntrl.addChild(StrokeColor);
	    divStrokeCntrlColor.addChild(divStrokeColorCntrl);

	    divStrokeCntrlWidthValue.addChild(StrokeWidthValue);
	    divStrokeCntrlWidthSlider.addChild(StrokeSlider);

	    divStrokeCntrlWidth.addChild(divStrokeCntrlWidthValue).addChild(divStrokeCntrlWidthSlider);

	    div1.addChild(divStrokeWidthHeader).addChild(divStrokeCntrlWidth);

	    divStrokeCntrlSlider.addChild(div1);

	    divStrokeCntrl.addChild(divStrokeHeader).addChild(divStrokeCntrlColor).addChild(divStrokeCntrlSlider)

	    return divStrokeCntrl;
	    //divStrokeCntrl.appendTo('#' + _divowner);
	};

	var setup = function() {
<<<<<<< HEAD
		var dfd = new $.Deferred();
		var load = function() {
			control.properties.update(jsonInput);

			console.log('jsonInput:', jsonInput);
			//var values = control.cmg_functions.convertOffsetsToAngleDistance(control.properties.xOffsetShadow, (control.properties.yOffsetShadow * -1));
			var values = control.cmg_functions.convertOffsetsToAngleDistance(control.properties._xOffset, (control.properties._yOffset * -1));
			console.log('setup, distance:', values.Distance);
			control.properties.distanceShadow = Math.round(values.Distance);
			control.properties.angleShadow = Math.round(values.angle);

			$(document).mouseup(function (e) {
				control.isMouseDown = false;
			});
			dfd.resolve(values);
		}();
		return dfd.promise();
=======
		if(jsonInput) { //updates any and all properties dynamically.
			for(var property in jsonInput) {
				control.properties[property] = jsonInput[property];
			}
		}

		var values = control.cmg_functions.convertOffsetsToAngleDistance(control.properties.xOffsetShadow, control.properties.yOffsetShadow * - 1);
		control.properties.distanceShadow = Math.round(values.Distance);
		control.properties.angleShadow = Math.round(values.angle);

		$(document).mouseup(function (e) {
			control.isMouseDown = false;
		});
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	};

	//user will be able to have access to all of the internal data of the entire handler,
	//such as color, x and y offset values etc...
	var returnObject = control.properties;
	returnObject.appendTo = function(input) { //simply add a property to the returned object.
<<<<<<< HEAD
		var dfd = new $.Deferred()
		console.log('appendTo:', input);

		setup().done(function(values) {
			//input is the id of the div to append everything to.
			control.shadowCNTRL(values).appendTo(input);

			//control.properties.divcontainer = input.substring(1, input.length); //so that the rest of this handler will know where it was appended.
			if(input.type) { //if jsonHTML object is the input.
				control.properties.divcontainer = input.id;
			} else {
				control.properties.divcontainer = input.substring(1, input.length);
			}
			dfd.resolve(input);	
		});
		returnObject.state = dfd.promise();
		return returnObject;
=======
		//input is the id of the div to append everything to.
		console.log('appendTo:', input);
		setup();
		control.shadowCNTRL().appendTo(input);
		//the substring process removes the # symbol from the input.

		//throwing an error here for some reason.
		//control.properties.divcontainer = input.substring(1, input.length); //so that the rest of this handler will know where it was appended.
		if(input.type) { //if jsonHTML object is the input.
			control.properties.divcontainer = input.id;
		} else {
			control.properties.divcontainer = input.substring(1, input.length);
		}
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	};
	/*
		Function: updateWithObject
		Requires: A fabricJS object to update all of the properties information above.
	*/
	returnObject.updateWithObject = function(obj) { //depricated use setRGBA(object.shadow);
		control.properties.setRGBA(obj.shadow);
	};
<<<<<<< HEAD
	returnObject.refresh = function() {
		var main = arrdb.query({
			where: {
				objectName: 'divShadowCntrl',
			}
		});
		main[0].remove();
		this.appendTo(main[0].parent);
	};
=======
>>>>>>> 1c8e1cd02b6a3abdd8fb986840bc879f3d0be131
	returnObject.attach = {
		handlers: function() { //after the jsonHTML has been appended, attach all the handlers.
			setup();
		},
		opacityControl: function() {
			return control.opacityCNTL();
		},
		strokeControl: function() {
			return control.strokeCNTRL();
		},
	};
	returnObject.setOnChange = function(func) {
		control.properties.handlerFunction = func;
	};
	returnObject.setDebugMode = function(obj) {
		control.properties.debugMode = obj;
	};

	return returnObject;
};