

var templateFunctions = {
    submitText: function(canvas, text, textProperties) {
        var dfd = new $.Deferred();
        function addIt() {
            var t = new fabric.Text(text, textProperties);
            t.id = 'Text' + makeID();
            t.on('selected', function() {
                selected = t.id;
            });
            arrdb.hash(t);
            canvas.add(t);
            console.log(t.id);
            dfd.resolve();
        }
        addIt();
        return dfd.promise();
    },
};

var template = {
    textMenu: function(width, height) {
        var formJSON = {
            width: width,
            height: height,
        };
        
        var sel = function(options, properties) {
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
        };
        
    	
    	var selections = function() {
            var fontTypes = [
        		'Select Font Type',
        		'Arial',
        	];
            var fontSizes = [
                20,
                8,
                9,
                10,
                11,
                13,
                15,
                18,
                21,
                24,
                27
            ];
        	var fontSelection = sel(fontTypes, {
        	    id: 'fontSelection',
        	    title: 'Select Your Font',
        	});
            var sizeSelection = sel(fontSizes, {
                id: 'sizeSelection',
                title: 'Select Your Font Size',
            });
            return $jConstruct('div').addChild(fontSelection).addChild(sizeSelection);
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
            var submit = $jConstruct('button', {
                text: 'submit',
            }).event('click', function() {
                var txt = $('#canvasTextInput').val();
                templateFunctions.submitText(fabCanvas, txt, {
                    fontSize: $('#sizeSelection').val(),
                    fontFamily: $('#fontSelection').val(),
                }).done(function() {
                    $.colorbox.close();
                });
            });
            
            var cancel = $jConstruct('button', {
                text: 'cancel',
            }).event('click', function() {
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
    
    kitBar: function(width, height) {
        var buttons = [
            $jConstruct('button', {
                text: 'Add Text',
            }).event('click', function() {
                var menu = template.textMenu(450, 270);
                $.colorbox({html: '<div id="cbObj"></div>', width: (menu.width.toString() + 'px'), height: (menu.height.toString() + 'px')});
                menu.html.appendTo('#cbObj');
            }),
            
            $jConstruct('button', {
                text: 'Add Image',
            }),
            
            $jConstruct('button', {
                text: 'Remove',
            }).event('click', function() {
                var obj = arrdb.get(selected);
                if(obj) {
                    obj.remove();
                }
            }),
            
            $jConstruct('button', {
                text: 'Layer Up',
            }).event('click', function() {
                var obj = arrdb.get(selected);
                if(obj) {
                    obj.bringForward(true);
                }
            }),
            
            $jConstruct('button', {
                text: 'Layer Down',
            }).event('click', function() {
                var obj = arrdb.get(selected);
                if(obj) {
                    obj.sendBackwards(true);
                }
            }),
            
            $jConstruct('button', {
                text: 'Settings',
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