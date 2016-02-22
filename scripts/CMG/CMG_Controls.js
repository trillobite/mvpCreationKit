//This controls requires these libraries
//http://code.jquery.com/jquery-1.10.2.min.js
//jquery-ui.js
//evol.colorpicker.js
//jsonHTML.js

//The required style sheets 
//CMG_Controls_Styles.css
//evol.colorpicker.min.css
//jquery-ui.css

var App = App || {};
App.Controls = App.Controls || {};

App.Controls.Gobals_mouseDown = false


// constructor
/*{
    _xOffset: "integer",
    _yOffset: "integer",
    _Color: "hex color value",
    _Opacity: "integer",
    _Blur: "integer",
    _divowner: "string",
    _DivContanier: "string",
    _ColorBoxontanier: "string"
}*/
App.Controls.LayerShadowControls = function (jSoninputValues) {
    var _thiscontrol = this;

    // Object attributes
    this.xOffsetShadow = jSoninputValues._xOffset;
    this.yOffsetShadow = jSoninputValues._yOffset;
    this.colorShadow = jSoninputValues._Color;
    this.opacityShadow = jSoninputValues._Opacity;
    this.blurShadow = jSoninputValues._Blur;
    this.distanceShadow = 0;
    this.angleShadow = 0;
    this.divcontainer = jSoninputValues._DivContanier;
    this.divcolorbox = jSoninputValues._ColorBoxontanier;

    //container for change function
    //Only 1 needed for this purpose
    this._ChangeHandlerFunction;

    //using jsonHTML create the html controls for this object    
    cmg_functions.CreateShadowCNTRLHTML(jSoninputValues._divowner);

    //Convert offsets to angle and distance
    var values = cmg_functions.ConvertOffestsToAngleDistance(this.xOffsetShadow, this.yOffsetShadow * -1);
    this.distanceShadow = Math.round(values.Distance);
    this.angleShadow = Math.round(values.angle);

    //Setup color Picker
    $("#ShadowColor").colorpicker({
        hideButton: true
    });

    //set color
    $("#ShadowColor").colorpicker("val", this.colorShadow);
    $('#ShadowColor').css('background-color', this.colorShadow);
    $('#ShadowColor').css('color', this.colorShadow);


    //color colntrol hooks
    $("#ShadowColor").on("change.color", function (event, color) {
        $('#ShadowColor').css('background-color', color);
        $('#ShadowColor').css('color', color);
        _thiscontrol.colorShadow = color;
        _thiscontrol._ChangeHandlerFunction();
    });


    // Hooks for JQuery Sliders
    var selectSlider2Value = $("#ShadowDistanceValue");
    var sliderDistance = $("#Slider2").slider({
        min: 0,
        max: 30,
        range: "min",
        value: selectSlider2Value[0].value,
        slide: function (event, ui) {
            selectSlider2Value[0].value = ui.value;
            _thiscontrol.distanceShadow = ui.value;
            var values = cmg_functions.ConvertAngleDistancetoOffests(_thiscontrol.angleShadow, _thiscontrol.distanceShadow);
            _thiscontrol.xOffsetShadow = values.OffsetX;
            _thiscontrol.yOffsetShadow = values.OffsetY - 1;
            _thiscontrol._ChangeHandlerFunction();
        }
    });
    var selectSlider3Value = $("#ShadowOpacityValue");
    var sliderOpacity = $("#Slider3").slider({
        min: 1,
        max: 100,
        range: "min",
        value: selectSlider3Value[0].value,
        slide: function (event, ui) {
            selectSlider3Value[0].value = ui.value;
            _thiscontrol.opacityShadow = ui.value / 100;
            _thiscontrol._ChangeHandlerFunction();

        }
    });
    var selectSlider4Value = $("#ShadowBlurValue");
    var sliderBlur = $("#Slider4").slider({
        min: 0,
        max: 30,
        range: "min",
        value: selectSlider4Value[0].value,
        slide: function (event, ui) {
            selectSlider4Value[0].value = ui.value;
            _thiscontrol.blurShadow = ui.value;
            _thiscontrol._ChangeHandlerFunction();
        }
    });

    //set defaults
    cmg_functions.rotateAnimation($("#imgShadowControl")[0], this.angleShadow)
    $("#txtShadowAngle").val(Math.round((this.angleShadow)));

    // set Blur
    $("#ShadowBlurValue").val(Math.round(this.blurShadow));
    $("#Slider4").slider('value', this.blurShadow);

    //set distance
    $("#ShadowDistanceValue").val(Math.round(this.distanceShadow));
    $("#Slider2").slider('value', this.distanceShadow);

    // set Opcaity
    $("#ShadowOpacityValue").val(Math.round(this.opacityShadow * 100));
    $("#Slider3").slider('value', this.opacityShadow * 100);

    //events to drive angle movements
    $("#imgShadowControl").mousemove(function (e) {

        if (App.Controls.Gobals_mouseDown) {
            GetImageShadowDirection(this, e, _thiscontrol.divcolorbox, _thiscontrol.divcontainer);
        }
    });
    $("#imgShadowControl").mousedown(function (e) {
        //prevent default mousedown behavior
        e.preventDefault();

        App.Controls.Gobals_mouseDown = true;
        GetImageShadowDirection(this, e, _thiscontrol.divcolorbox, _thiscontrol.divcontainer);
    });
    $(document).mouseup(function (e) {
        App.Controls.Gobals_mouseDown = false;
    })

    //calculate angle from mouse cursor position
    function GetImageShadowDirection(object, e, divcolorbox, divcontainer) {
       
        //var parentPosition = getPosition(e.currentTarget);
        var parentPosition = getPosition(object, divcolorbox, divcontainer);
        var xPosition = e.clientX - parentPosition.x;
        var yPosition = e.clientY - parentPosition.y;
        //console.log(parentPosition.data);

        var _xloc = xPosition - object.width / 2;
        //Setting y positive directio to up
        var _yloc = 1 - (yPosition - object.height / 2);

        var RadToDegree = 360 / (2 * Math.PI);
        var angle = Math.atan(_xloc / _yloc);

        if (_xloc >= 0 && _yloc >= 0) {
            //upperright quad
            if (_yloc == 0) {
                angle = 90;
            } else {
                angle = RadToDegree * angle;
            }
        } else if (_xloc >= 0 && _yloc < 0) {
            //lowerright quad
            angle = 180 + (RadToDegree * angle);
        } else if (_xloc <= 0 && _yloc < 0) {
            //lowerleft quad
            angle = 180 + (RadToDegree * angle);
        } else if (_xloc <= 0 && _yloc >= 0) {
            //Upper left quad
            if (_yloc == 0) {
                angle = 270;
            } else {
                angle = 360 + (RadToDegree * angle);
            }
        }
        _thiscontrol.angleShadow = parseInt(angle);
        var values = cmg_functions.ConvertAngleDistancetoOffests(_thiscontrol.angleShadow, _thiscontrol.distanceShadow);
        _thiscontrol.xOffsetShadow = values.OffsetX;
        _thiscontrol.yOffsetShadow = values.OffsetY * -1;
        $("#txtShadowAngle").val(parseInt(angle));
        cmg_functions.rotateAnimation(object, angle);
        _thiscontrol._ChangeHandlerFunction();
    }

    function getPosition(element, divcolorbox, divcontainer) {


        var xPosition = 0;
        var yPosition = 0;
        var elementdata = "";

        //adjustment for scroll in user code
        var st = 0;
        var sl = 0;
        if ($("#" + divcontainer).length > 0) {
            var st = $("#" + divcontainer)[0].scrollTop;
            var sl = $("#" + divcontainer)[0].scrollLeft;
        }
        xPosition = xPosition - sl
        yPosition = yPosition - st

        //colorbox adjustment
        st = 0;
        sl = 0;
        if ($("#" + divcolorbox).length > 0) {
            var st = $("#" + divcolorbox)[0].scrollTop;
            var sl = $("#" + divcolorbox)[0].scrollLeft;
        }
        xPosition = xPosition - sl
        yPosition = yPosition - st


        while (element) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            elementdata += "|" + element.id + "," + element.offsetTop + "," + element.scrollTop + "," + element.clientTop;
            element = element.offsetParent;
        }



        return { x: xPosition, y: yPosition, data: elementdata };
    }




};



/*{
_Opacity: "integer",
_divowner: "string"
}*/
App.Controls.LayerOpacityControls = function (jSoninputValues) {
    var _thiscontrol = this;

    // Object attributes
    this.opacityLayer = jSoninputValues._Opacity;

    //container for change function
    //Only 1 needed for this purpose
    this._ChangeHandlerFunction;

    cmg_functions.CreateLayerOpacityCNTRLHTML(jSoninputValues._divowner)

    var selectSliderLayerOpacity = $("#LayerOpacityValue");
    var sliderLayerOpacity = $("#SliderLayerOpacity").slider({
        min: 0,
        max: 100,
        range: "min",
        value: selectSliderLayerOpacity[0].value,
        slide: function (event, ui) {
            selectSliderLayerOpacity[0].value = ui.value;
            _thiscontrol.opacityLayer = ui.value / 100;
            _thiscontrol._ChangeHandlerFunction();
        }
    });

    $("#LayerOpacityValue").val(this.opacityLayer * 100);
    $("#SliderLayerOpacity").slider('value', this.opacityLayer * 100);
};

/*{
_Width: "real",
_Color: "hex color value",
_divowner: "string"
}*/
App.Controls.LayerStrokeControls = function (jSoninputValues) {
    var _thiscontrol = this;

    // Object attributes
    this.widthstroke = jSoninputValues._Width;
    this.colorstroke = jSoninputValues._Color;
   
    //container for change function
    //Only 1 needed for this purpose
    this._ChangeHandlerFunction;

    cmg_functions.CreateLayerStrokeCNTRLHTML(jSoninputValues._divowner)

    //Setup color Picker
    $("#StrokeColor").colorpicker({
        hideButton: true
    });

    //set color
    $("#StrokeColor").colorpicker("val", this.colorstroke);
    $('#StrokeColor').css('background-color', this.colorstroke);
    $('#StrokeColor').css('color', this.colorstroke);



    //color colntrol hooks
    $("#StrokeColor").on("change.color", function (event, color) {
        $('#StrokeColor').css('background-color', color);
        $('#StrokeColor').css('color', color);
        _thiscontrol.colorstroke = color;
        _thiscontrol._ChangeHandlerFunction();
    });

    var selectSliderLayerStroke = $("#StrokeWidthValue");
    var sliderLayerStroke = $("#StrokeSlider").slider({
        min: 0,
        max: 100,
        range: "min",
        value: selectSliderLayerStroke[0].value,
        slide: function (event, ui) {
            selectSliderLayerStroke[0].value = ui.value / 10;
            _thiscontrol.widthstroke = ui.value / 10;
            _thiscontrol._ChangeHandlerFunction();
        }
    });

    $("#StrokeWidthValue").val(this.widthstroke);
    $("#StrokeSlider").slider('value', this.widthstroke * 10);
};


var cmg_functions = {
    rotateAnimation: function (img, degrees) { //takes a string
        if (navigator.userAgent.match("Chrome")) {
            img.style.WebkitTransform = "rotate(" + degrees + "deg)";
        } else if (navigator.userAgent.match("Firefox")) {
            img.style.MozTransform = "rotate(" + degrees + "deg)";
        } else if (navigator.userAgent.match("MSIE")) {
            img.style.msTransform = "rotate(" + degrees + "deg)";
        } else if (navigator.userAgent.match("Opera")) {
            img.style.OTransform = "rotate(" + degrees + "deg)";
        } else {
            img.style.transform = "rotate(" + degrees + "deg)";
        }
    },
    ConvertOffestsToAngleDistance: function (OffsetX, OffsetY) {
        var angle = 0;
        var Distance = 0;
        var RadToDegree = 360 / (2 * Math.PI);

        if (OffsetX == 0 && OffsetY == 0) {
            //upperright quad
            //defaults apply

        } else if (OffsetX >= 0 && OffsetY >= 0) {
         
            //upperright quad
            if (OffsetY == 0) {
                angle = 90;
            } else {
                angle = RadToDegree * Math.atan(OffsetX / OffsetY);
            }
        } else if (OffsetX >= 0 && OffsetY < 0) {

            //lowerright quad
            angle = 180 + (RadToDegree * Math.atan(OffsetX / OffsetY));
        } else if (OffsetX <= 0 && OffsetY < 0) {
            //lowerleft quad
            angle = 180 + (RadToDegree * Math.atan(OffsetX / OffsetY));
        } else if (OffsetX <= 0 && OffsetY >= 0) {
            //Upper left quad
            if (OffsetY == 0) {
                angle = 270;
            } else {
                angle = 360 + (RadToDegree * Math.atan(OffsetX / OffsetY));
            }
        }
        Distance = Math.sqrt(Math.pow(OffsetX, 2) + Math.pow(OffsetY, 2));
        return {
            angle: angle,
            Distance: Distance
        };
    },
    ConvertAngleDistancetoOffests: function (angle, Distance) {
        var RadToDegree = 360 / (2 * Math.PI);
        var OffsetX = Math.round(Distance * Math.abs(Math.sin(angle / RadToDegree)));
        var OffsetY = Math.round(Distance * Math.abs(Math.cos(angle / RadToDegree)));

        if (angle >= 0 && angle <= 90) {
            //default positive
        } else if (angle > 90 && angle <= 180) {
            OffsetY = -1 * OffsetY;
        } else if (angle > 180 && angle <= 270) {
            OffsetX = -1 * OffsetX;
            OffsetY = -1 * OffsetY;
        } else if (angle > 270 && angle < 360) {
            OffsetX = -1 * OffsetX;
        }
        return {
            OffsetX: OffsetX,
            OffsetY: OffsetY
        };
    },
    CreateShadowCNTRLHTML: function (_divowner) {
        //create html
        //the main div.
        var divShadowCntrl = $jConstruct('div', {
            id: 'divShadowCntrl'
        }).addChild($jConstruct('div', {
            id: 'divShadowHeader',
            text: 'Layer Shadow'
        }));


        //shadow control direction tools

        //I sometimes define a var just to make things easier to understand.
        var controlImage = $jConstruct('div', {
            id: 'divShadowControlImgage'
        }).addChild($jConstruct('img', {
            id: 'imgShadowControl',
            src: 'ArrowCircle.png',
            alt: 'ArrowCircle.png'
        }));


        //if above fails, try this:
        var controlAngle = $jConstruct('div', {
            id: 'divShadowControlAngle'
        }).addChild($jConstruct('textbox', {
            id: 'txtShadowAngle',
            text: '0',
            readonly: 'readonly'
        }));

        var colorControl = $jConstruct('div', {
            id: 'divShadowColorCntrl'
        }).addChild($jConstruct('input', {
            id: 'ShadowColor',
            class: 'colorPicker evo-cp0'
        }).event('click', function() {
            //console.log('ShadowColor, this:', this);
            //$('#'+this.id).colorpicker('showPalette'); //edit 07/29/2015
        }));

        var divShadowCntrlDirection = $jConstruct('div', {
            id: 'divShadowCntrlDirection'
        }).addChild(controlImage).addChild(controlAngle).addChild(colorControl);

        //add to the main div.
        divShadowCntrl.addChild(divShadowCntrlDirection);


        //shadow control slider tools

        var cntrlDistance = $jConstruct('div', {
            id: 'divShadowCntrlDistance'
        });
        cntrlDistance.addChild($jConstruct('div', {
            id: 'divShadowCntrlDistanceValue'
        }).addChild($jConstruct('textbox', {
            id: 'ShadowDistanceValue',
            text: '0',
            readonly: 'readonly'
        })));
        cntrlDistance.addChild($jConstruct('div', {
            id: 'divShadowCntrlDistanceSlider'
        }).addChild($jConstruct('div', {
            id: 'Slider2'
        })));

        var cntrlDistanceContainer = $jConstruct('div').addChild($jConstruct('div', {
            id: 'divShadowDistanceHeader',
            text: 'Distance'
        })).addChild(cntrlDistance);


        var cntrlOpacity = $jConstruct('div', {
            id: 'divShadowcntrlOpacity'
        });
        cntrlOpacity.addChild($jConstruct('div', {
            id: 'divShadowcntrlOpacityValue'
        }).addChild($jConstruct('textbox', {
            id: 'ShadowOpacityValue',
            text: '100',
            readonly: 'readonly'
        })));
        cntrlOpacity.addChild($jConstruct('div', {
            id: 'divShadowcntrlOpacitySlider'
        }).addChild($jConstruct('div', {
            id: 'Slider3'
        })));

        var cntrlShadowContainer = $jConstruct('div').addChild($jConstruct('div', {
            id: 'divShadowOpacityHeader',
            text: 'Opacity'
        })).addChild(cntrlOpacity);


        var cntrlBlur = $jConstruct('div', {
            id: 'divShadowCntrlBlur'
        });
        cntrlBlur.addChild($jConstruct('div', {
            id: 'divShadowCntrlBlurValue'
        }).addChild($jConstruct('textbox', {
            id: 'ShadowBlurValue',
            text: '0',
            readonly: 'readonly'
        })));
        cntrlBlur.addChild($jConstruct('div', {
            id: 'divShadowCntrlBlurSlider'
        }).addChild($jConstruct('div', {
            id: 'Slider4'
        })));

        var cntrlBlurContainer = $jConstruct('div').addChild($jConstruct('div', {
            id: 'divShadowBlurHeader',
            text: 'Blur'
        })).addChild(cntrlBlur);

        var divShadowCntrlSliders = $jConstruct('div', {
            id: 'divShadowCntrlSliders'
        }).addChild(cntrlDistanceContainer).addChild(cntrlShadowContainer).addChild(cntrlBlurContainer);
        divShadowCntrl.addChild(divShadowCntrlSliders);

        divShadowCntrl.appendTo('#' + _divowner);
    },
    CreateLayerOpacityCNTRLHTML: function (_divowner) {
        //level1
        var divLayerOpacityValue = $jConstruct('div', {
            id: 'divLayerOpacityValue'
        }).addChild(LayerOpacityValue);

        var SliderLayerOpacity = $jConstruct('div', {
            id: 'SliderLayerOpacity'
        });
        //level2
        var LayerOpacityValue = $jConstruct('textbox', {
            id: 'LayerOpacityValue',
            text: '0',
            readonly: 'readonly'
        }).addChild(divLayerOpacityValue);

        var SliderLayerOpacity = $jConstruct('div', {
            id: 'divLayerOpacitySlider'
        }).addChild(SliderLayerOpacity);

        //level3
        var divLayerOpacityCntrl = $jConstruct('div', {
            id: 'divLayerOpacityCntrl'
        }).addChild(LayerOpacityValue).addChild(SliderLayerOpacity);

        var divLayerOpacityHeader = $jConstruct('div', {
            id: 'divLayerOpacityHeader',
            text: 'Layer Opacity'
        });

        //level4
        var _div = $jConstruct('div').addChild(divLayerOpacityHeader).addChild(divLayerOpacityCntrl);

        var divLayerOpacityCntrl = $jConstruct('div', {
            id: 'divLayerOpacityCntrlSlider'
        }).addChild(_div);

        divLayerOpacityCntrl.appendTo('#' + _divowner);
    },
    CreateLayerStrokeCNTRLHTML: function (_divowner) {
        var divStrokeCntrl = $jConstruct('div', {
            id: 'divStrokeCntrl'
        });
        var divStrokeHeader = $jConstruct('div', {
            id: 'divStrokeHeader',
            text: 'Layer Stroke'
        });
        var divStrokeCntrlColor = $jConstruct('div', {
            id: 'divStrokeCntrlColor'
        });
        var divStrokeColorCntrl = $jConstruct('div', {
            id: 'divStrokeColorCntrl'
        });
        var StrokeColor = $jConstruct('textbox', {
            id: 'StrokeColor',
            class: 'colorPicker evo-cp0'
        });
        var divStrokeCntrlSlider = $jConstruct('div', {
            id: 'divStrokeCntrlSlider'
        });
        var div1 = $jConstruct('div');
        var divStrokeWidthHeader = $jConstruct('div', {
            id: 'divStrokeWidthHeader',
            text: 'Width'
        });
        var divStrokeCntrlWidth = $jConstruct('div', {
            id: 'divStrokeCntrlWidth'
        });
        var divStrokeCntrlWidthValue = $jConstruct('div', {
            id: 'divStrokeCntrlWidthValue'
        });
        var StrokeWidthValue = $jConstruct('textbox', {
            id: 'StrokeWidthValue',
            text: '0',
            readonly: 'readonly'
        });
        var divStrokeCntrlWidthSlider = $jConstruct('div', {
            id: 'divStrokeCntrlWidthSlider'
        });
        var StrokeSlider = $jConstruct('div', {
            id: 'StrokeSlider'
        });

        divStrokeColorCntrl.addChild(StrokeColor);
        divStrokeCntrlColor.addChild(divStrokeColorCntrl);

        divStrokeCntrlWidthValue.addChild(StrokeWidthValue);
        divStrokeCntrlWidthSlider.addChild(StrokeSlider);

        divStrokeCntrlWidth.addChild(divStrokeCntrlWidthValue).addChild(divStrokeCntrlWidthSlider);

        div1.addChild(divStrokeWidthHeader).addChild(divStrokeCntrlWidth);

        divStrokeCntrlSlider.addChild(div1);

        divStrokeCntrl.addChild(divStrokeHeader).addChild(divStrokeCntrlColor).addChild(divStrokeCntrlSlider)

        divStrokeCntrl.appendTo('#' + _divowner);
    }
};







