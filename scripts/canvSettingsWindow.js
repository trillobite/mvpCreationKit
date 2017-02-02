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


    var canvasColorOption = function() {
        var container = $jConstruct('div');
        var colorSquare = $jConstruct('div').css({
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
        container.addChild(label);

        return container;
    };

    main.addChild(lockMovementOption);
    main.addChild(customerViewOption);
    main.addChild(canvasColorOption);
    
    return main;
};