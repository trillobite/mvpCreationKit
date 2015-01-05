var fabCanvas; //allows the canvas to be globally accessible.
var selected; //id of the current object that has focus.
var projDB = new micronDB();

//data to be modified by the user/programmer.
//this allows the web application to have the credentials in order to pull it's required data from the server.
var credentials = {
	PricingFormID: 4,
	PhotographerID: 7,
};

//data that the application utilizes.
var projData = {
	availCanv: {},
	canvObj: {},
};

//Functions for modifying the data within the canvas.
var projFuncs = {
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
    addImage: function(data, canvas) {
        fabric.Image.fromURL(data.result, function(oImg) {
            oImg.id = "Image" + makeID();
            oImg.on('selected', function() {
                selected = oImg.id;
            });
            projDB.insert(oImg);
            canvas.add(oImg);
            console.log(oImg.id);
        });
    },
    addText: function(canvas, text, textProperties) {
        var dfd = new $.Deferred();
        function addIt() {
            var t = new fabric.Text(text, textProperties);
            t.id = 'Text' + makeID();
            t.on('selected', function() {
                selected = t.id;
            });
            projDB.insert(t); //make sure the object is in micronDB.
            canvas.add(t);
            console.log(t.id);
            dfd.resolve();
        }
        addIt();
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
};


$(document).ready(function() {
    var canvas = $jConstruct('canvas', {
        id: 'c',
        width: '1024',
        height: '768',
    }).css({
        'border': '1px solid black',
        'border-radius': '5px',
    }).appendTo('#main'); //append to the main container.
    
    fabCanvas = new fabric.Canvas('c'); //cause dis canvas is fabulious!
    
    template.kitBar(fabCanvas.getWidth(), '25px').appendTo('#main', 'prepend');
    
    $('.canvas-container').filedrop({
        maxfiles: 1,
        maxfilesize: 5,
        beforeSend: function(f) {
            console.log(f);
            projFuncs.readFile(f).done(function(obj) {
                console.log('the file', obj);
                projFuncs.addImage(obj, fabCanvas);
            });
        }
    });
    
    //starts up the introduction menu window.
    $db.getCanvas(credentials.PricingFormID, credentials.PhotographerID).done(function(obj) {
        $.colorbox({html: '<div id="cbDateEdit"></div>', width: '400', height: '300'});
	projData.availCanv = JSON.parse(obj);
        canvMen.gen(projData.availCanv).appendTo('#cbDateEdit');
	$.colorbox.resize({width: $('#canvSelMenu').width(), height: $('#canvSelMenu').height()});
    });  
});
