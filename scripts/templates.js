

var template = {
    loading: function() {
        return $jConstruct('div', {
            id: 'loadSpinner',
        }).css({
            'opacity': '0.5',
            'position': 'fixed',
            'left': '0px',
            'top': '0px',
            'width': '100%',
            'height': '100%',
            'z-index': '9999',
            'background': "url('./css/images/spinner128.gif') 50% 50% no-repeat rgb(249,249,249)",            
        });
    },
    customColorbox: function(obj) {
        $.colorboxCustom({
            html: '<div id="cbCustom" style="width:100%;height:100%;"></div>',
            width: '400',
            height: '300',
            //opacity: '0.5',
            top: '5%',
            left: '65%',
            overlayClose: false
        });

        //defined before the buttons, order of rendering declared later.
        var contentBox = $jConstruct('div').css({
            'border': '1px solid black',
            'border-radius': '5px',
            'width': '300',
            'height': '300',
            'float': 'left',
        });

        var positionHandle = $jConstruct('img', {
            id: 'dragArrow',
            src: './css/images/crossArrow.png',
            title: 'click and drag to move window.'
        }).css({
            'width': '25px',
            'height': '25px',
            'float': 'right',
            'cursor': 'grabbing',
        });

        var setObj = function(id, appendID) {
            $jConstruct('div', {
                text: id,
            }).event('click', function() {
                console.log(projDB.get(id));
            }).css({
                'cursor': 'pointer',
            }).appendTo(appendID);
        };

        //sets the css of the buttons
        var buttonCSS = {
            'width': '25px',
            'height': '25px',
            'float': 'right',
            'cursor': 'pointer',
        };

        //searches for specified object type, and fills the div with the id's of those objects.
        var fillObjects = function(objType, appendID) {
            $(appendID).empty();
            var obj = projDB.query({
                where: {
                    type: objType,
                },
            });
            for (var i = 0; i < obj.length; ++i) {
                setObj(obj[i].id, appendID);
            }
        };

        var images = $jConstruct('img', {
            id: 'imgsBtn',
            src: './css/images/pictures.png',
            title: 'view image objects',
        }).css(buttonCSS).event('click', function() {
            fillObjects('image', '#'+contentBox.id);
        });

        var textObjBtn = $jConstruct('img', {
            id: 'textObjBtn',
            src: './css/images/photoshop.png',
            title: 'view text objects',
        }).css(buttonCSS).event('click', function() {
            fillObjects('text', '#'+contentBox.id);
        });

        //allows for the correct order of rendering.
        positionHandle.appendTo('#cbCustom');
        images.appendTo('#cbCustom');
        textObjBtn.appendTo('#cbCustom');
        contentBox.appendTo('#cbCustom');
        var w = parseInt($('#'+contentBox.id).width()) + 70;
        var h = parseInt($('#'+contentBox.id).height()) + 80;
        console.log(w, h);

        //set the arrow as the handle to move the colorbox.
        $('#colorboxCustom').tinyDraggable({handle:'#dragArrow', exclude:'input, textarea'});
        $('#cboxcOverlay').remove();
        $('#colorboxCustom').jScroll();
        //$('#cboxcContent').css({'opacity': '0.7'});
        $.colorboxCustom.resize({width: w.toString(), height: h.toString()});
    },
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
            
            var colors = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange'];
            
            var setBackColor = template.select(colors, {
                id: 'setBackColor',
                title: 'Change the background color of the canvas.',
            }).addFunction(function() { //after this selection option is rendered, change to current canvas color.
                for(var i = 0; i < $('#setBackColor')[0].options.length; ++i) {
                    if($('#setBackColor')[0].options[i].text == fabCanvas.backgroundColor) {
                        $('#setBackColor')[0].selectedIndex = i;
                        console.log('success!', $('#setBackColor')[0].options[i].text);
                    }
                }
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
                $('#loadSpinner').show();
        		//$db.svCanJson(PricingFormCanvasID, PhotographerID, DesignData)
                var canvData = fabCanvas.toJSON();
                canvData.canvDimensions = { //add existing width and height to the saved canvas data.
                    width: fabCanvas.width,
                    height: fabCanvas.height,
                };
        		canvData = JSON.stringify(canvData);
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
