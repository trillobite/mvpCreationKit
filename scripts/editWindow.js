

var editWindow = function(obj) {
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
        'overflow': 'auto',
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
            $(appendID).empty();
            var obj = projDB.get(id); //get the object by id.

            var advancedOptions = [];
            var advanced = $jConstruct('div', {
                text: 'Advanced',
            }).event('click', function() {
                $('#'+advanced.id).remove();
                for(var i = 0; i < advancedOptions.length; ++i) {
                    advancedOptions[i].appendTo(appendID);
                }
            });

            for(var k in obj) { //loop through the properties of that object.
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
                    var advancedFilter = ['text', 'id', 'width', 'height', 'stroke', 'scale', 'fill', 'angle', 'background'];
                    for(var i = 0; i < advancedFilter.length; ++i) {
                        if(value.toString().indexOf(advancedFilter[i]) > -1) {
                            return false;
                        }
                    }
                    return true;
                };
                var addProperty = function(value, variable, checkFunc) {
                    if(checkFunc(value, variable)) {
                        var mkDiv = function(value) {
                            return $jConstruct('div').css({
                                'width': '100%',
                            }).addChild($jConstruct('div', {
                                text: value.toString(),
                            }).event('click', function() {
                                console.log(variable[value].toString());
                            }).css({
                                'cursor': 'pointer',
                            }));
                        };
                        if(ifAdvancedOption(value)) {
                            advancedOptions[advancedOptions.length] = mkDiv(value);
                        } else {
                            mkDiv(value).appendTo(appendID);
                        }
                    }
                };
                addProperty(k, obj, check); //add the property to the list of user accessible objects.
                //advanced.appendTo(appendID);
            }
            advanced.appendTo(appendID);
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
    var lastfill; //stores what the object type was last time.
    var fillObjects = function(objType, appendID) {
        if(objType) {
            lastfill = objType;
        }
        $(appendID).empty();
        var obj = projDB.query({ //output can possibly return array of arrays and objects (mixed).
            where: {
                type: lastfill,
            },
        });
        //recursive function, populates the window with the object's ID's
        var populate = function(input) {
	        for (var i = 0; i < input.length; ++i) {
	        	if(toolKit().getType(input[i]) == 'array') { //query will sometimes return an array, depending on the hash table contents.
	        		populate(input[i]);
	        	} else {
	        		setObj(obj[i].id, appendID);
	        	}
	        }
        };
        populate(obj);
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
    var h = parseInt($('#'+contentBox.id).height()) + 100;
    console.log(w, h);

    //set the arrow as the handle to move the colorbox.
    $('#colorboxCustom').tinyDraggable({handle:'#dragArrow', exclude:'input, textarea'});
    $('#cboxcOverlay').remove();
    $('#colorboxCustom').jScroll();
    //$('#cboxcContent').css({'opacity': '0.7'});
    $.colorboxCustom.resize({width: w.toString(), height: h.toString()});
};