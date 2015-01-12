

var template = {
    //constructs a button, containing only a click handler (all that's needed for now).
    button: function(text, event, css) {
        var btn = $jConstruct('button', {
            text: text,
        });
        if(css) {
            btn.css(css);
        }
        if(event) {
            btn.event('click', event);
        }
        return btn;
    },
    select: function(options, properties) {
        function makeOption(input) {
            return $jConstruct('option', {
                text: input,
                value: input, 
            });
        }
        var box = $jConstruct('select', {
            id: properties.id,
            title: properties.title,
        });
        $(options).each(function() {
            box.addChild(makeOption(this));
        });
        return box;
    },

    textMenu: function(width, height) {
        var formJSON = {
            width: width,
            height: height,
        };
        var selections = function() {
            var fontTypes = ['Select Font Type', 'Arial', 'mono'];
            var colors = ['black', 'red', 'blue', 'green', 'yellow', 'orange', 'white'];
            var fontSelection = template.select(fontTypes, {
                id: 'fontSelection',
                title: 'Select Your Font',
            });
            var sizeSelection = $jConstruct('spinner', {
                id: 'sizeSelection',
                value: '12',
                title: 'Select Your Font Size',
            }).css({
                'width': '50px',
            });

            var colorSelection = template.select(colors, {
                id: 'colorSelection',
                title: 'Select Your Text Color',
            });
            return $jConstruct('div').addChild(fontSelection).addChild(sizeSelection).addChild(colorSelection);
        };
        
        var textInput = function() {
            return $jConstruct('div').addChild($jConstruct('textarea', {
                id: 'canvasTextInput',
                rows: "5",
                cols: "45",
                text: 'Enter your text here.',
            }));
        };
        
        var buttons = function() {
            var submit = template.button('Submit', function() {
                var txt = $('#canvasTextInput').val();
                projFuncs.addText(fabCanvas, txt, {
                    fontSize: $('#sizeSelection').val(),
                    fontFamily: $('#fontSelection').val(),
                    fill: $('#colorSelection').val(),
                }).done(function() {
                    $.colorbox.close();
                });
            });
            
            var cancel = template.button('Cancel', function() {
                $.colorbox.close();
            });
            
            return $jConstruct('div').addChild(submit).addChild(cancel).css({
                'text-align': 'right',
            });
        };
        
        var menuTitle = $jConstruct('div', {
            text: '<h3>Add Text</h3>',
        }).css({
            'text-align': 'center',
        });
        
        var container = $jConstruct('div', {
            id: 'txtMenContainer',
        }).css({
            "width": (formJSON.width - 55).toString() + 'px',
            "height": (formJSON.height - 110).toString() + 'px',
            'text-align': 'left',
        }).addChild(menuTitle).addChild(selections()).addChild(textInput()).addChild(buttons());
        
        formJSON.html = container;
        return formJSON;
    },
    
    editText: function(width, height) {
        var txt = projDB.get(selected);
        var box = this.textMenu(width, height);
        console.log(box);
        box.html.children[0].text = '<h3>Edit Text</h3>';
        box.html.children[2].children[0].text = txt.text;
        box.html.children[3].children[0] = this.button('Submit', function() {
            projFuncs.modifyText(txt.id, {
                text: $('#canvasTextInput').val(),
                fontSize: $('#sizeSelection').val(),
                fontFamily: $('#fontSelection').val(),
                fill: $('#colorSelection').val(),
            }).done(function() {
                $.colorbox.close();
                fabCanvas.calcOffset();
                fabCanvas.renderAll(); //have to do this twice in order for it to look correct.
            });
        });
        return box;
    },
    
    canvasSettings: function(width, height) {
        var main = {
            width: width,
            height: height,
        };
        
        var boxContainer = (function() {
            var wBox = $jConstruct('textbox', {
                text: fabCanvas.width.toString(),
            });
            var hBox = $jConstruct('textbox', {
                text: fabCanvas.height.toString(),
            });
            return $jConstruct('div').addChild(wBox).addChild(hBox);
        })();
        
        var btnContainer = (function() {
            var btnApply = template.button('Apply', function() {
                fabCanvas.setBackgroundColor($('#setBackColor').val());
                fabCanvas.setWidth(parseInt($('#'+boxContainer.children[0].id).val()));
                fabCanvas.setHeight(parseInt($('#'+boxContainer.children[1].id).val()));
                $.colorbox.close();
            });
            var btnCancel = template.button('Cancel', function() {
                $.colorbox.close();
            });
            return $jConstruct('div').addChild(btnApply).addChild(btnCancel);
        })();

        main.html = (function() {
            var backBox = $jConstruct('textbox', {
                text: 'set background image',
                title: 'Coming Soon!',
            });
            
            var colors = ['Select Background Color', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'white'];
            
            var setBackColor = template.select(colors, {
                id: 'setBackColor',
                title: 'Change the background color of the canvas.',
            });
            
            var title = $jConstruct('div', {
                text: '<h3>Canvas Settings</h3>',
            }).css({
                'text-align': 'center',
            });
            return $jConstruct('div').addChild(title).addChild(boxContainer).addChild(backBox).addChild(setBackColor).addChild(btnContainer);
        })();

        return main;
    },
    
    kitBar: function(width, height) {
        //shortcut/alias to more quickly create buttons, also shrinks code.
        var kBtn = function(text, func) {
            return template.button(text, function() {
                var obj = projDB.get(selected); //get the original object.
                if(obj) {
                    func(obj); //execute function on click
                }
            });
        };
        var buttons = [
            template.button('Add Text', function() {
                var menu = template.textMenu(450, 270);
                $.colorbox({html: '<div id="cbObj"></div>', width: (menu.width.toString() + 'px'), height: (menu.height.toString() + 'px')});
                menu.html.appendTo('#cbObj');
            }),
            template.button('Edit Text', function() {
                var menu = template.editText(450,270);
                $.colorbox({html: '<div id="cbObj"></div>', width: (menu.width.toString() + 'px'), height: (menu.height.toString() + 'px')});
                menu.html.appendTo('#cbObj');
            }),
            template.button('Add Image'),
            kBtn('Remove', function(obj) {
                obj.remove(); //remove the selected object
            }),
            kBtn('Layer Up', function(obj) {
                obj.bringForward(true); //move selected object up the Z stack.
            }),
            kBtn('Layer Down', function(obj) {
                obj.sendBackwards(true); //move selected object down the Z stack.
            }),
            template.button('Settings', function() {
                var menu = template.canvasSettings(300, 255);
                $.colorbox({html: '<div id="cbObj"></div>', width: (menu.width.toString() + 'px'), height: (menu.height.toString() + 'px')});
                menu.html.appendTo('#cbObj');
            }),
            template.button('Save', function() {
		//$db.svCanJson(PricingFormCanvasID, PhotographerID, DesignData)
		var canvData = JSON.stringify(fabCanvas.toJSON());
		var PricingFormCanvasID = projData.availCanv._Canvases[parseInt(canvSelected)]._indxPhotographerPackagePriceCanvasID;
		var PhotographerID = credentials.PhotographerID;
                //console.log(PricingFormCanvasID, PhotographerID, canvData);
		$db.svCanJson(canvSelectedID, PhotographerID, canvData).done(function(data) {
			console.log('Done:', data);
		});
            }),
        ];

        var bar = $jConstruct('div').css({
            'border': '1px solid black',
            'border-radius': '5px',
        }).css({
            'width': width,
            'height': height,
        });
        
        $(buttons).each(function() {
            bar.addChild(this);
        });
        
        return bar;
    },
};
