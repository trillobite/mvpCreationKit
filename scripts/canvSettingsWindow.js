var canvSettingsWindow = {};

canvSettingsWindow.render = function() {
    var main = $jConstruct('div');

    var lockMovementOption = function() {
        var container = $jConstruct('div').css({
            'width': '350px',
            'float': 'left',
            'clear': 'right',
            'margin-bottom': '20px',
        });

        var checkbox = $jConstruct('input', {
            type: 'checkbox',
            text: 'Lock Movement',
        }).addFunction(function() {
            document.getElementById(checkbox.id).checked = !fabCanvas.selection;
        }).event('click', function(input) {
            console.log($('#'+input.currentTarget.id)[0].checked);
            fabCanvas.selection = !fabCanvas.selection;
            fabCanvas.forEachObject(function(o) {
                //o.selectable = fabCanvas.selection;
                o.lockMovementX = !fabCanvas.selection;
                o.lockMovementY = !fabCanvas.selection;
            });
        }).css({
            'float': 'left',  
        });

        var label = $jConstruct('div', {
            text: 'Lock Movement',
        }).css({
            'float': 'left',
        });

        container.addChild(checkbox);
        container.addChild(label);

        return container;
    };

    var customerViewOption = function() {
        var container = $jConstruct('div').css({
            'width': '350px',
            'float': 'left',
            'clear': 'right',
            'margin-bottom': '20px',
        });

        var checkbox = $jConstruct('input', {
            type: 'checkbox',
            text: 'Enable Customer View',
        }).addFunction(function() {
            document.getElementById(checkbox.id).checked = fabCanvas.customerView;
        }).event('click', function(input) {
            console.log($('#'+input.currentTarget.id)[0].checked);
            fabCanvas.customerView = !fabCanvas.customerView;
            fabCanvas.forEachObject(function(o) {
                var setBool = fabCanvas.customerView;
                o.lockMovementX = setBool;
                o.lockMovementY = setBool;
                o.lockScalingX = setBool;
                o.lockScalingY = setBool;
                o.lockRotation = setBool;
            });
        }).css({
            'float': 'left',  
        });

        var label = $jConstruct('div', {
            text: 'Enable Customer View',
        }).css({
            'float': 'left',
        });

        container.addChild(checkbox);
        container.addChild(label);

        return container;
    };

    var canvasSizeSet = function() {
        var container = $jConstruct('div').css({
            'width': '350px',
            'float': 'left',
            'clear': 'right',
            'margin-bottom': '20px',
        });

        var txtBxW = $jConstruct('textbox', {
            text: fabCanvas.width,
            title: 'width',
        }).css({
            'float': 'left',
            'width': '100px',  
        });

        var txtBxH = $jConstruct('textbox', {
            text: fabCanvas.height,
            title: 'height',
        }).css({
            'float': 'left', 
            'width': '100px', 
        });

        var btnSet = $jConstruct('button', {
            text: 'set',
        }).event('click', function() {
            var w = document.getElementById(txtBxW.id).value;
            var h = document.getElementById(txtBxH.id).value;
            fabCanvas.setWidth(parseInt(w)); //set the width.
            fabCanvas.setHeight(parseInt(h)); //set the height.
        }).css({
            'float': 'left',  
        });

        container.addChild(txtBxW).addChild(txtBxH);
        container.addChild(btnSet);

        return container;
    }

    /*$jConstruct('input', {
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
		//$('#ShadowColor').colorpicker('showPalette');
		$('#'+control.domElements.colorInput.id).colorpicker('showPalette');
	});*/

    var canvasColorOption = function() {
        var container = $jConstruct('div');

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
        }).css({
            'float': 'left',
            'cursor': 'pointer',
        });

        /*var colorSquare = $jConstruct('div', {
            objectName: 'canvasColor',
        }).addFunction(function() {
            $('#'+colorSquare.id).colorpicker({
                defaultPalette: 'web',
                hideButton: true,
                history: false,
            });
            $('#'+colorSquare.id).colorpicker('val', fabCanvas.backgroundColor);
            $('#'+colorSquare.id).on('change.color', function (event, color) {
                $('#'+colorSquare.id).css('background-color', color);
                fabCanvas.backgroundColor = projFuncs.rgbConstruct(color);
                console.log('background color:', projFuncs.rgbConstruct(color));
                fabCanvas.renderAll();
            });
        }).event('click', function(event, color) {
            $('#'+colorSquare.id).colorpicker('showPalette');
        }).css({
            'float': 'left',
            'width': '55px',
            'height': '50px',
            'background-color': fabCanvas.backgroundColor,
            'border': '1px solid black',  
        });
        var label = $jConstruct('div', {
            text: 'Background Color',
        }).css({
            'float': 'left',
        });

        container.addChild(colorSquare);
        container.addChild(label);*/
        container.addChild(canvBkgrndColor);

        return container;
    };

    var canvasBackgroundDrop = function() {
        var container = $jConstruct('div');

        var bkDrop = $jConstruct('div', {
            text: 'Drop in a background!',
            class: 'backgorundDrop',
        }).addFunction(function() { //this is executed after the object is appended.

            console.log('Background drop executed.');

            $('.backgorundDrop').filedrop({
                maxfiles: 1,
                maxfilesize: 5,
                beforeSend: function(f) {
                    //console.log(f);
                    projFuncs.readFile(f).done(function(obj) {
                        //console.log('the file', obj);
                        projFuncs.addImageBackground(obj, fabCanvas, f.name).done(function() {
                            setTimeout(function() {
                                fabCanvas.renderAll(); //so that the new background will be displayed.
                                fabCanvas.renderAll(); //so that the new background will be displayed.
                            }, 250);
                        });
                    });
                }
            });

        }).css({
            'float': 'left',
            'border': '1px solid black',
            'border-radius': '5px',
            'width': '300px',
            'height': '150px',
        });

        container.addChild(bkDrop);

        return container;
    };

    main.addChild(lockMovementOption);
    main.addChild(customerViewOption);
    main.addChild(canvasSizeSet);
    main.addChild(canvasColorOption);
    main.addChild(canvasBackgroundDrop);
    
    return main;
};