
/*
    SYNTAX GOAL:
    var picker = new fontPicker({
      onActive: function() {
  
      },
      onSelect: function() {
  
      },
      fonts: [],
    }).load('selection').appendTo('body');
*/

var fontPicker = function(input) {
  var fontPickerDB = {
    fonts: {
      active: false,
    },
    selection: {
      active: false,
      object: undefined,
    }
  };
  var getGoogleAPI = function() {
    (function() {
      var wf = document.createElement('script');
      wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();
  };

  var fonts = ['Open+Sans', 'Lora', 'Raleway', 'Inconsolata', 'Special+Elite', 'Alegreya+Sans', 'Great+Vibes', 'Tangerine'];

  var convertFonts = function(f) {
    fonts = f ? f : fonts;
    var tmp = [];
    for(var i = 0; i < fonts.length; ++i) {
      tmp[tmp.length] = fonts[i].replace(' ', '+') + '::latin';
    }
    return tmp;
  };

  var load = {
    fonts: function(f) {
      var dfd = new $.Deferred();
      WebFontConfig = { //creates a global variable.
        google: { 
          families: convertFonts(f),
        },
        active: function() {
          if(input.onActive) {
            input.onActive();
          }
          fontPickerDB.fonts.active = true;
          dfd.resolve();
        }
      };
      getGoogleAPI();
      return dfd.promise();
    },
    selection: function(f) {
      var loadIt = function() {
        var select = $jConstruct('select').event('change', function() {
          console.log(this.value);
          if(undefined !== input.onSelect) {
            input.onSelect(this.value);
          }
        });
        for(var i = 0; i < fonts.length; ++i) {
          var tmp = fonts[i].replace('+', ' ');
          select.addChild($jConstruct('option', {
            text: tmp,
            value: tmp,
          }).css({
            'font-family': tmp,
          }));
        }
        fontPickerDB.selection.active = true; //makes sure the user cannot attempt to execute selection loader more than once.
        return select;
      };
      console.log({
        selection: fontPickerDB.selection.active,
        font: fontPickerDB.fonts.active,
      });
      if(fontPickerDB.selection.active == false) { //Do I need to render the select object?
        if(fontPickerDB.fonts.active == false) { //Do the fonts need to be loaded?
          var dfd = new $.Deferred();
          load.fonts(f).done(function() { //get the fonts loaded, so that the select object can load.
            console.log('loaded fonts');
            fontPickerDB.selection.object = loadIt(); //so that the user has a place to access it later.
            dfd.resolve(fontPickerDB.selection.object); //jsonHTML select object returned through the jQuery resolve function.
          });
          return dfd.promise(); //So that the user can determine when the selection object has properly loaded.
        } else {
          fontPickerDB.selection.object = loadIt();
          return fontPickerDB.selection.object; //just produce the selection object, and return it for the user.
        }
      };
    },
  };
  //this is the interface that is given to the user.
  return {
    load: function(arg, arg2) {
      return load[arg](arg2); //allow direct access to the load functions.
    },
    object: fontPickerDB.selection.object, //so that the user can access the rendered object easier.
  };
};