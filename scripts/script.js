var fabCanvas; //allows the canvas to be globally accessible.
var selected; //id of the current object that has focus.
var canvSelected; //index of which projData.avilCanv._Canvases[] which is being modified.
var canvSelectedID; //the ID of the current canvas on the Database.
var projDB = new micronDB();

//data to be modified by the user/programmer.
//this allows the web application to have the credentials in order to pull it's required data from the server.
var credentials = {
	PricingFormID: 4,
	PhotographerID: 7,
};

//data that the application utilizes.
var projData = {
    lastImgDrpFileName: "",
    rawCanvData:{},
	availCanv: {},
	canvObj: {},
};

//Functions for modifying the data within the canvas.
var projFuncs = {
    /*
        mutableDB & mutableFunc*
        -These functions/properties, allows the editWindow.js code to modify the click handler
        functionality of the canvas objects.
        -Currently, these function's default settings are to trigger a click listener on one of the 
        buttons within the editWindow. When the editWindow initializes it's code, it will modify
        this function to operate in another way. This explains the object name mutable-Func.
    */
    mutableDB: {}, //where mutableFunc will store its data.
    mutableFuncImgs: function(input) {
        var obj = projDB.get(input);
        $('#imgsBtn').trigger('click');
    },
    mutableFuncTxt: function(input) {
        var obj = projDB.get(input);
        $('#textObjBtn').trigger('click');
    },
    readFile: function(file, startByte, endByte) {
        var dfd = new $.Deferred();
        var reader = new FileReader();
        reader.onload = function(evt) {
            if(evt.target.readyState == FileReader.DONE) {
                dfd.resolve(evt.target); //resulting object is put into the resolve.
            }
        }
        var blob = file.slice((parseInt(startByte) || 0), (parseInt(endByte) || file.size + 1) + 1);
        reader.readAsDataURL(blob);
        return dfd.promise();
    },
    //used if image dropped onto the canvas, or the data URI is not known.
    addImage: function(data, canvas, fileName) {
        var dfd = new $.Deferred();
        $('#loadSpinner').show();
        
        //console.log('uploading...', fileName);
        console.log('debug output:', credentials.PhotographerID, fileName, data.result);
        $db.svCanImg(credentials.PhotographerID, fileName, data.result).done(function(returnData) {
            console.log('image is located at:', returnData.responseText);

            //adds the image to the canvas
            var load = function () {
                fabric.Image.fromURL(returnData.responseText, function(oImg) {
                    if(undefined === oImg.id) {
                        oImg.id = "Image" + makeID();
                    }
                    if(undefined === oImg.name) {
                        oImg.name = "name not defined";
                    }
                    /*funcManipulator.parStore[oImg.id] = undefined;*/
                    oImg.on('selected', function() {
                        selected = oImg.id;
                        projFuncs.mutableFuncImgs(oImg.id);
                        /*if(funcManipulator.parStore[oImg.id] && funcManipulator.manipulator) { //if all the required data is there.
                            funcManipulator.manipulator(funcManipulator.parStore[oImg.id]); //execute the function.
                        }*/
                    });
                    projDB.insert(oImg);
                    canvas.add(oImg);
                    console.log('Done!', oImg.id);
                    $('#loadSpinner').fadeOut('slow');
                    dfd.resolve(oImg);
                });
            };

            //will load the data if the image is availible on the server.
            var cnt = 0;
            var check = function() {
                $db.imageExists(returnData.responseText).done(function(data) {
                    if(data) {
                        console.log('loading data...');
                        load(); //will now add the image.
                    } else {
                        console.log('image not ready, retry in 1 second...');
                        setTimeout(function(){ 
                            ++cnt;
                            if(cnt < 20) {
                                check();
                            } else {
                                console.log('Image failed to upload.');
                            }
                        }, 1000); //will wait 1 second and try again.
                    }
                    
                });
            };

            check();

            
        });
        return dfd.promise();
    },
    //function is utilized if the data URI of the image is known.
    addImg: function(canvas, url, imgProperties) {
        delete imgProperties._element;
        delete imgProperties._originalElement;

        var dfd = new $.Deferred();
        fabric.Image.fromURL(url, function(oImg) {
            projFuncs.modifyObject(oImg, imgProperties); //make sure the object carries all the same properties.
            if(undefined === oImg.id) {
                oImg.id = 'Image' + makeID(); //make sure that it has the correct id.
            }
            if(undefined === oImg.name) {
                oImg.name = 'name not defined';
            }
            /*funcManipulator.parStore[oImg.id] = undefined;*/ //setup a space for this object.
            oImg.on('selected', function() {
                selected = oImg.id;
                projFuncs.mutableFuncImgs(oImg.id);
                //$('#imgsBtn').trigger('click');
                /*if(funcManipulator.parStore[oImg.id] && funcManipulator.manipulator) { //if all data is there.
                    funcManipulator.manipulator(funcManipulator.parStore[oImg.id]); //use the property specified for this object by the id.
                }*/
            });
            projDB.insert(oImg);
            canvas.add(oImg);
            dfd.resolve(oImg);
        });

        return dfd.promise();
    },
    addText: function(canvas, text, textProperties) {
        var dfd = new $.Deferred();
        function addIt() {
            var t = new fabric.Text(text, textProperties);
            if(undefined === t.id) {
                t.id = 'Text' + makeID(); //make sure that it has the correct id.
            }
            if(undefined === t.name) {
                t.name = 'name not defined';
            }
            /*funcManipulator.parStore[t.id] = undefined;*/ //setup a space for this object.
            t.on('selected', function() {
                selected = t.id;
                projFuncs.mutableFuncTxt(t.id);
            });
            projDB.insert(t); //make sure the object is in micronDB.
            canvas.add(t);
            dfd.resolve(t);
        }
        addIt();
        return dfd.promise();
    },
    //sets the properties of an object, to the same as what is contained in the modifyers parameter.
    modifyObject: function(obj, modifyers) {
        var dfd = new $.Deferred();
        var update = function() {
            for(var property in modifyers) {
                obj[property] = modifyers[property];
            }
            fabCanvas.renderAll();
            dfd.resolve();
        };
        update();
        return dfd.promise();
    },
    modifyText: function(key, modifyers) {
        var dfd = new $.Deferred();
        var update = function() {
            for(var property in modifyers) {
                projDB.get(key)[property] = modifyers[property];
            }
            fabCanvas.renderAll();
            dfd.resolve();
        };
        update();
        return dfd.promise();
    },
    //Will take the data within projData.canvObj and fill the canvas with it.
    loadProjData: function(data) {
        var tmpDB = [];
        var ready = [];

        var dimensionCanvas = function(settings) {
            fabCanvas.setWidth(parseInt(settings.width));
            fabCanvas.setHeight(parseInt(settings.height));
        };

        var initializeArray = function() {
            for(var i = 0; i < data.objects.length; ++i) {
                ready[i] = 0;
            }
        };

        initializeArray();
        if(data.canvDimensions) { //if the dimensions are provided.
            dimensionCanvas(data.canvDimensions); //dimension the canvas with the inputted data
        }
        if(data.background) {
            fabCanvas.setBackgroundColor(data.background);
        }

        var isReady = function() { //checks if the objects are ready to be organized.
            //console.log('ready array:', ready);
            for(var cntr = 0; cntr < ready.length; ++cntr) {
                if(!(ready[cntr])) { //moment a cell is undefined, function returns false.
                    return false;
                }
            }
            return true;
        };

        var setLayers = function () {
            console.log('layering objects...');
            //now organize the objects by their intended z index.
            for(var i = 0; i < tmpDB.length; ++i) {
                var tmpObj = projDB.get(tmpDB[i][0]); //get the object.
                //console.log('the object:', tmpObj);
                tmpObj.moveTo(tmpDB[i][1]); //move it around on the stack.
            }
            console.log('finished');
            var testing = shadoWindow.build(projDB.query({
                where: {
                    collection: function(input) {
                        return input != undefined;
                    },
                }
            }));
            //$('#loadSpinner').fadeOut('slow');
        };

        for(var i = 0; i < data.objects.length; ++i) {
            if(undefined === data.objects[i].id) {
                data.objects[i].id = makeID();
            }
            if(data.objects[i].type == "text") {
                data.objects[i].id = 'Text' + makeID();
                data.objects[i].tmpIndx = i;
                tmpDB[tmpDB.length] = [data.objects[i].id, i]; //log the id of the object, and log it's position in the array. (determines the z index)
                projFuncs.addText(fabCanvas, data.objects[i].text, data.objects[i]).done(function(txtObj) {
                    //console.log(txtObj.tmpIndx, 'finished.'); //i is not the original index after the object has been resolved.
                    ready[txtObj.tmpIndx] = true;
                    if(isReady()) {
                        setLayers();
                    }
                });
            } else {
                data.objects[i].id = 'Image' + makeID();
                data.objects[i].tmpIndx = i;
                tmpDB[tmpDB.length] = [data.objects[i].id, i]; //log the id of the object, and log it's position in the array. (determines the z index)
                projFuncs.addImg(fabCanvas, data.objects[i].src, data.objects[i]).done(function(imgObj) {
                    //console.log(imgObj.tmpIndx, 'finished.'); //i is not the original index after the object has been resolved.
                    ready[imgObj.tmpIndx] = true;
                    if(isReady()) { //when all the objects have been added.
                        setLayers();
                    }
                });
            }           
        }
        fabCanvas.renderAll();//render the objects onto the canvas.
    },
};


$(document).ready(function() {
    template.loading().appendTo('body');

    var f = ['Open+Sans', 'Lora', 'Raleway', 'Inconsolata', 'Special+Elite', 'Alegreya+Sans', 'Great+Vibes', 'Tangerine'];
    var convertFonts = function(fonts) { 
        var tmp = [];
        for(var i = 0; i < fonts.length; ++i) {
            tmp[tmp.length] = fonts[i].replace(' ', '+') + '::latin';
        }
        return tmp;
    };

    //creates a global variable that the API will utilize.
    WebFontConfig = { 
        google: { 
            families: convertFonts(f),
        },
    };

    (function() { //code supplied by google.
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })();

    var canvas = $jConstruct('canvas', {
        id: 'c',
        width: '1024',
        height: '768',
    }).css({
        'border': '1px solid black',
        'border-radius': '5px',
    }).appendTo('#main'); //append to the main container.
    
    fabCanvas = new fabric.Canvas('c'); //cause dis canvas is fabulious!
    
    //template.kitBar(fabCanvas.getWidth(), '25px').appendTo('#main', 'prepend');
    
    $('.canvas-container').filedrop({
        maxfiles: 1,
        maxfilesize: 5,
        beforeSend: function(f) {
            //console.log(f);
            projFuncs.readFile(f).done(function(obj) {
                //console.log('the file', obj);
                projFuncs.addImage(obj, fabCanvas, f.name);
            });
        }
    });
    
    $.colorbox({html: '<div id="cbDateEdit"></div>', width: '400', height: '300'});

    //starts up the introduction menu window.
    $db.getCanvas(credentials.PricingFormID, credentials.PhotographerID).done(function(obj) {
        setTimeout(function() {
            $('#loadSpinner').fadeOut('slow');
        }, 500);
    	/*$('#cbDateEdit').empty();*/
    	projData.availCanv = obj;
            canvMen.gen(projData.availCanv).appendTo('#cbDateEdit').state.done(function() {
    		$.colorbox.resize(); //after rendering of html, resize the colorbox.
    	});
    });  
});




/*

$.colorboxCustom({html: '<div id="cbDateEditCustom" style="width:100%;height:100%;"></div>', width: '400', height: '300'});
Object { 0: <a.cboxcElement>, length: 1 }
$('#colorboxCustom').tinyDraggable({handle:'#cbDateEditCustom', exclude:'input, textarea'});
Object { 0: <div#colorboxCustom>, length: 1, context: HTMLDocument → creationkitdevelopment, selector: "#colorboxCustom" }




RANDOM NOCACHE DATA:
    *IF YOU DONT KNOW WHAT THIS IS, IGNORE IT: 

for (var i = 0; i < Math.floor((Math.random() * 50) + 1); ++i) {
    console.log(makeID());
}

    COPY AND PASTE THAT CODE INTO YOUR JAVASCRIPT CONSOLE, PASTE OUTPUT HERE:

"q8CrZD1NFZyY"
"aFNIA1ZZ0EyA"
"Y64n9FUSE37w"
"LtKeGA0Ot5Yg"
"DtAEHUrn3njq"
"XHp5bv6VdVTn"
"DIp7ZkWksYLC"
"fmL98RshuoVv"
"PCkKc6eXxDig"
"wThdnq7UH1je"
"95rXzsSAZuWk"
"P97BAKpOXQQb"


*/