var LShadowControl;
var LOpacityControl;
var LStrokeControl;

$(function () {
    //xOffset, yOffest, Color, Opacity, Blur,div
    LShadowControl = new App.Controls.LayerShadowControls({
        _xOffset: "7",
        _yOffset: "7",
        _Color: "#d0d0d0",
        _Opacity: ".70",
        _Blur: "20",
        _divowner: "ShadowControl",
        _DivContanier: "",
        _ColorBoxontanier:"cboxLoadedContent"
    });
    LShadowControl._ChangeHandlerFunction = function changes() {
        $('#myxOffset').val("xOffset = " + LShadowControl.xOffsetShadow);
        $('#myyOffset').val("yOffset = " + LShadowControl.yOffsetShadow);
        $('#myAngle').val("Angle = " + LShadowControl.angleShadow);
        $('#myDistance').val("Distance = " + LShadowControl.distanceShadow);
        $('#myColor').val("Color = " + LShadowControl.colorShadow);
        $('#myOpacity').val("Opacity = " + LShadowControl.opacityShadow);
        $('#myBlur').val("Blur = " + LShadowControl.blurShadow);
    };

    LOpacityControl = new App.Controls.LayerOpacityControls({
        _Opacity: ".60",
        _divowner: "OpacityControl"
    });
    LOpacityControl._ChangeHandlerFunction = function changes() {
        $('#LayerOpacity').val("Layer Opacity = " + LOpacityControl.opacityLayer);
    };

    LStrokeControl = new App.Controls.LayerStrokeControls({
        _Width: "5",
        _Color: "#244061",
        _divowner: "StrokeControl"
    });
    LStrokeControl._ChangeHandlerFunction = function changes() {
        $('#strokeColor1').val("Stroke Color = " + LStrokeControl.colorstroke);
        $('#strokeWidth').val("Stroke Wiodth = " + LStrokeControl.widthstroke);
    };
    
})
