/*
                                    ~MVP TOOL KIT~
    DESCRIPTION: A code library to easily manage an HTML5 Canvas using JQuery.
                 Most specifically, it is best used to manage the DOM for HTML 5 
                 web applications, with the backend being .NET & SQL.
    AUTHOR: Jesse Parnell
                            *PROPERTY OF MULTI VISUAL PRODUCTS*
*/

//colors used most often in this project. colors can be tweaked here.
var $p = function (obj) {
    var options = {
        blue: '#3287CC',  
        darkBlue: '#205480',
        gray: '#CCCCCC',
        midgray: '#A6A6A6',
        purple: '#5233A6',
        red: '#A8150D',
        amber: '#A62334',
        lightAmber: '#CC2B40',
        color: function (id) {
            return cmd.rgbToHex($('#'+id)[0].style['color']).toUpperCase();
        },
    };
    return undefined !== options[obj] ? options[obj] : undefined;
};

//easier call to commonly used mvpCanvas functions.
function $m(obj0, obj1) {
    return {
        typ: toolKit().getType(obj0),
    }
}

/*
                                    SQL.
*/

function $sql(obj) {
    return {
        get: function (callback) { return toolKit().genericXMLHTTPSend(obj, callback); }, //manage sql directly from the XMLHTTP string.
    };
}


function toolKit() {
    return {

        //similar to typeof, now more specific for Kinetic JS objects.
        getType: function (objVar) {
            var undef;
            var strReturn = undef;
            if (undef !== objVar) {
                function toType(obj) {
                    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
                }

                try {
                    strReturn = objVar.className != undef ? objVar.className : strReturn;
                    strReturn = strReturn == undef && objVar.nodeType != undef ? objVar.nodeType : strReturn;
                    strReturn = strReturn == undef && toType(objVar) != undef ? toType(objVar) : strReturn;
                    strReturn = strReturn == undef && typeof objVar != undef ? typeof objVar : strReturn;
                } catch (a) {
                    try {
                        strReturn = objVar.nodeType != undef ? objVar.nodeType : strReturn;
                        strReturn = strReturn == undef && toType(objVar) != undef ? toType(objVar) : strReturn;
                        strReturn = strReturn == undef && typeof objVar != undef ? typeof objVar : strReturn;
                    } catch (b) {
                        try {
                            strReturn = toType(objVar) != undef ? toType(objVar) : strReturn;
                            strReturn = strReturn == undef && typeof objVar != undef ? typeof objVar : strReturn;
                        } catch (c) {
                            try {
                                strReturn = typeof objVar != undef ? typeof objVar : strReturn;
                            } catch (d) {
                                //console.debug('Error getType: ' + d);
                                //console.debug(objVar);
                            }
                        }
                    }
                }
                if (strReturn == 'Group') {
                    var tmp;
                    try {
                        tmp = objVar.children[0].className;
                    } catch (e) {
                        console.debug('Error getType: ', e);
                    }
                    if (tmp) {
                        strReturn = strReturn + '.' + tmp;
                    }
                }
            }
            return strReturn;
        },

        //Prerequisites: JQuery.
        //generic way of retrieving data from server side scripts Asynchroniously.
        genericXMLHTTPSend: function (webMthdURL, callback) {
            if (window.XMLHttpRequest) {
                xmlhttp = new XMLHttpRequest();
            }
            xmlhttp.open('GET', webMthdURL, true);
            xmlhttp.send();
            var setRtrnVal = function () {
                var deferred = new $.Deferred();
                xmlhttp.onreadystatechange = function () {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        rtrnVal = xmlhttp.responseText
                        deferred.resolve();
                    }
                }
                return deferred.promise();
            };

            setRtrnVal().done(function () {
                if (undefined !== callback) {
                    if (undefined === rtrnVal || rtrnVal === "") {
                        callback('there was no returned value');
                    } else {
                        callback(rtrnVal);
                    }
                }
            });
        },

        //Prerequisites: None.
        //takes an image, gets the size, and sets the html div width and height to the same.
        setDivSizeByImage: function (img0, divElm) {
            divElm.style.width = $m(img0).width;
            divElm.style.height = $m(img0).heigh;
        },

        //Use: rgbToHex($('#foo0')[0].style.backgroundColor.substring(4, $('#foo0')[0].style.backgroundColor.length-1).split(', '));
        rgbToHex: function (rgb) { //converts rgb color definition to HEX.
            var arrRGB = rgb.substring(4, rgb.length-1).split(', ');
            return "#" + ((1 << 24) + ( parseInt(arrRGB[0]) << 16) + ( parseInt(arrRGB[1]) << 8) + parseInt(arrRGB[2]) ).toString(16).slice(1);
        },

        //toggles the text box so that it is more easily editable.
        tgglTxtBx: function(id, dbVal, defVal, updateFunc) {
            var object = function (val, color) { //getter setter awesomeness!!!
                if(undefined !== val) {
                    if(undefined !== color) {
                        $('#'+id).css({
                            'color': color,
                        });
                    }
                    $('#'+id)[0].value = val;
                } else {
                    return { //if both parameters were undefined, returns this object.
                        color: toolKit().rgbToHex($('#'+id)[0].style['color']).toUpperCase(), 
                        value: $('#'+id)[0].value,
                    };
                }
            };

            var blur = function() {
                if(object().color == $p('purple')) { //purple if the entry was edited!
                    if(undefined !== dbVal && '' !== dbVal && null !== dbVal) {
                        if(object().value === '') {
                            object(undefined !== previousTxt ? previousTxt : dbVal);
                        }
                    } else {
                        if(previousTxt !== defVal && undefined !== previousTxt) {
                            if(object().value === '') {
                                object(previousTxt, $p('purple'));
                            }
                        } else {
                            if(object().value === '') {
                                object(defVal, $p('gray'));
                            }
                        }
                    }
                }
                if(updateFunc) {
                    updateFunc(id);
                    object(object().value, $p('red'));
                }
                previousTxt = undefined;
            };
            var hasfocus = false;
            $('#'+id).blur(function() {
                blur();
                hasfocus = false;
            }).click(function() {
                if(!hasfocus) {
                    $('#'+id).select();
                    hasfocus = false;
                }
                hasfocus = true;
            });
        },
    };
}

