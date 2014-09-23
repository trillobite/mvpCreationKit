var fabCanvas; //allows the canvas to be globally accessible.
var selected; //id of the current object that has focus.

//this will have the scripts that will put everything together.
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
            arrdb.hash(oImg);
            canvas.add(oImg);
            console.log(oImg.id);
        });
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
});